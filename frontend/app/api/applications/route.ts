import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { copyFile, mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Rejected",
  "Selected",
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_RESUME_SIZE = 5 * 1024 * 1024;

function unauthorized() {
  return NextResponse.json(
    { error: "Please log in to continue." },
    { status: 401 }
  );
}

function forbidden(
  message = "You do not have permission to perform this action."
) {
  return NextResponse.json({ error: message }, { status: 403 });
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function parseTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

// GET: Students retrieve their own applications.
// Recruiters retrieve applicants for jobs they own.
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId")?.trim();
    const requestedEmail = searchParams
      .get("studentEmail")
      ?.trim()
      .toLowerCase();

    if (jobId) {
      if (user.role !== "Recruiter" && user.role !== "Admin") {
        return forbidden(
          "Only recruiters or admins can view job applicants."
        );
      }

      if (!UUID_REGEX.test(jobId)) {
        return NextResponse.json(
          { error: "Please provide a valid job ID." },
          { status: 400 }
        );
      }

      let query = `
        SELECT
          a.id,
          a.job_id,
          a.student_email,
          a.status AS application_status,
          a.applied_at,
          a.resume_name,
          a.resume_url,
          j.title,
          j.company,
          j.department,
          j.location,
          j.job_type,
          j.work_mode,
          j.salary
        FROM applications a
        INNER JOIN jobs j ON a.job_id = j.id
        WHERE a.job_id = $1
      `;

      const values: unknown[] = [jobId];

      if (user.role === "Recruiter") {
        query += ` AND j.recruiter_id = $2`;
        values.push(user.id);
      }

      query += ` ORDER BY a.applied_at DESC`;

      const result = await pool.query(query, values);

      return NextResponse.json(result.rows);
    }

    if (user.role === "Student") {
      if (
        requestedEmail &&
        EMAIL_REGEX.test(requestedEmail) &&
        requestedEmail !== user.email.toLowerCase()
      ) {
        return forbidden("You can only view your own applications.");
      }

      const result = await pool.query(
        `SELECT
           a.id,
           a.job_id,
           a.student_email,
           a.status AS application_status,
           a.applied_at,
           a.resume_name,
           a.resume_url,
           j.title,
           j.company,
           j.location,
           j.job_type,
           j.work_mode,
           j.salary
         FROM applications a
         INNER JOIN jobs j ON a.job_id = j.id
         WHERE LOWER(a.student_email) = LOWER($1)
         ORDER BY a.applied_at DESC`,
        [user.email]
      );

      return NextResponse.json(result.rows);
    }

    return forbidden(
      "Use a job ID to retrieve applicants for a specific job."
    );
  } catch (error) {
    console.error("Error fetching applications:", error);

    return NextResponse.json(
      { error: "Unable to fetch applications." },
      { status: 500 }
    );
  }
}

// POST: Check eligibility, then apply using a profile or custom resume.
export async function POST(request: Request) {
  let snapshotPath: string | null = null;
  let applicationSaved = false;

  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "Student") {
      return forbidden("Only students can apply for jobs.");
    }

    const formData = await request.formData();

    const jobIdValue = formData.get("jobId");
    const resumeOptionValue = formData.get("resumeOption");

    const jobId =
      typeof jobIdValue === "string" ? jobIdValue.trim() : "";

    const resumeOption =
      typeof resumeOptionValue === "string"
        ? resumeOptionValue
        : "profile";

    if (!UUID_REGEX.test(jobId)) {
      return NextResponse.json(
        { error: "Please provide a valid job ID." },
        { status: 400 }
      );
    }

    if (!["profile", "custom"].includes(resumeOption)) {
      return NextResponse.json(
        { error: "Please select a valid resume option." },
        { status: 400 }
      );
    }

    // 1. Retrieve the active job and its eligibility requirements.
    const jobResult = await pool.query(
      `SELECT
         id,
         title,
         min_cgpa,
         eligible_branches,
         eligible_graduation_years,
         required_skills
       FROM jobs
       WHERE id = $1
         AND status = 'Active'
         AND (deadline IS NULL OR deadline >= CURRENT_DATE)`,
      [jobId]
    );

    if (jobResult.rowCount === 0) {
      return NextResponse.json(
        {
          error:
            "This job is unavailable or its application deadline has passed.",
        },
        { status: 400 }
      );
    }

    const job = jobResult.rows[0];

    // 2. Retrieve the student's profile.
    const studentResult = await pool.query(
      `SELECT
         full_name,
         email,
         branch,
         graduation_year,
         cgpa,
         skills,
         resume_name,
         resume_url
       FROM users
       WHERE id = $1
         AND role = 'Student'
         AND is_active = TRUE`,
      [user.id]
    );

    if (studentResult.rowCount === 0) {
      return NextResponse.json(
        {
          error:
            "Your student account could not be found or is inactive.",
        },
        { status: 403 }
      );
    }

    const student = studentResult.rows[0];
    const reasons: string[] = [];

    // 3. Check minimum CGPA.
    if (job.min_cgpa !== null && job.min_cgpa !== undefined) {
      const minimumCgpa = Number(job.min_cgpa);

      const studentCgpa =
        student.cgpa === null || student.cgpa === undefined
          ? null
          : Number(student.cgpa);

      if (
        studentCgpa === null ||
        !Number.isFinite(studentCgpa)
      ) {
        reasons.push(
          "Add a valid CGPA to your profile before applying."
        );
      } else if (studentCgpa < minimumCgpa) {
        reasons.push(
          `Your CGPA (${studentCgpa}) is below the required minimum of ${minimumCgpa}.`
        );
      }
    }

    // 4. Check eligible branches.
    const eligibleBranches = parseTextArray(job.eligible_branches);
    const studentBranch = normalizeText(student.branch);

    if (eligibleBranches.length > 0) {
      if (!studentBranch) {
        reasons.push(
          "Add your branch to your profile before applying."
        );
      } else if (!eligibleBranches.includes(studentBranch)) {
        reasons.push(
          `Your branch (${student.branch}) is not eligible. Eligible branches: ${eligibleBranches.join(", ")}.`
        );
      }
    }

    // 5. Check eligible graduation years.
    const eligibleYears: number[] = Array.isArray(
      job.eligible_graduation_years
    )
      ? job.eligible_graduation_years.map(Number)
      : [];

    if (eligibleYears.length > 0) {
      const graduationYear =
        student.graduation_year === null ||
        student.graduation_year === undefined
          ? null
          : Number(student.graduation_year);

      if (
        graduationYear === null ||
        !Number.isInteger(graduationYear)
      ) {
        reasons.push(
          "Add your graduation year to your profile before applying."
        );
      } else if (!eligibleYears.includes(graduationYear)) {
        reasons.push(
          `Your graduation year (${graduationYear}) is not eligible. Eligible years: ${eligibleYears.join(", ")}.`
        );
      }
    }

    // 6. Check required skills.
    const requiredSkills = parseTextArray(job.required_skills);
    const studentSkills = new Set(
      parseTextArray(student.skills)
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !studentSkills.has(skill)
    );

    if (missingSkills.length > 0) {
      reasons.push(
        `Your profile is missing these required skills: ${missingSkills.join(", ")}. Update your profile if you have these skills.`
      );
    }

    // Reject ineligible applications before handling the resume.
    if (reasons.length > 0) {
      return NextResponse.json(
        {
          error: "You are not eligible for this job.",
          reasons,
        },
        { status: 403 }
      );
    }

    // 7. Prepare the resume snapshot.
    const resumesDirectory = path.join(
      process.cwd(),
      "uploads",
      "resumes"
    );

    const snapshotsDirectory = path.join(
      process.cwd(),
      "uploads",
      "application-resumes"
    );

    await mkdir(snapshotsDirectory, { recursive: true });

    let resumeName: string;
    let extension: string;
    let profileResumePath: string | null = null;
    let customResumeBuffer: Buffer | null = null;

    if (resumeOption === "custom") {
      const uploadedResume = formData.get("resume");

      if (
        !uploadedResume ||
        typeof uploadedResume === "string" ||
        typeof uploadedResume.arrayBuffer !== "function"
      ) {
        return NextResponse.json(
          { error: "Please select a resume file to upload." },
          { status: 400 }
        );
      }

      if (uploadedResume.size === 0) {
        return NextResponse.json(
          { error: "The selected resume file is empty." },
          { status: 400 }
        );
      }

      if (uploadedResume.size > MAX_RESUME_SIZE) {
        return NextResponse.json(
          { error: "Resume size must not exceed 5 MB." },
          { status: 400 }
        );
      }

      resumeName = path
        .basename(uploadedResume.name)
        .replace(/[\r\n"]/g, "_");

      extension = path.extname(resumeName).toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return NextResponse.json(
          { error: "Only PDF, DOC, and DOCX resumes are allowed." },
          { status: 400 }
        );
      }

      customResumeBuffer = Buffer.from(
        await uploadedResume.arrayBuffer()
      );
    } else {
      if (!student.resume_name || !student.resume_url) {
        return NextResponse.json(
          {
            error:
              "Please upload a resume in your profile or choose a custom resume.",
          },
          { status: 400 }
        );
      }

      const resumeMatch = String(student.resume_url).match(
        /^\/api\/student\/resume\/file\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:pdf|doc|docx))$/i
      );

      if (!resumeMatch) {
        return NextResponse.json(
          {
            error:
              "Your saved resume reference is invalid. Please upload your resume again.",
          },
          { status: 400 }
        );
      }

      const storedFilename = resumeMatch[1];

      extension = path.extname(storedFilename).toLowerCase();
      resumeName = path.basename(String(student.resume_name));

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return NextResponse.json(
          { error: "Unsupported profile resume format." },
          { status: 400 }
        );
      }

      profileResumePath = path.join(
        resumesDirectory,
        storedFilename
      );
    }

    // 8. Save a separate resume copy for this application.
    const applicationId = randomUUID();
    const snapshotFilename = `${applicationId}${extension}`;

    snapshotPath = path.join(
      snapshotsDirectory,
      snapshotFilename
    );

    if (resumeOption === "custom" && customResumeBuffer) {
      await writeFile(snapshotPath, customResumeBuffer, {
        flag: "wx",
      });
    } else if (profileResumePath) {
      await copyFile(profileResumePath, snapshotPath);
    } else {
      throw new Error("Unable to determine the selected resume.");
    }

    const snapshotUrl = `/api/applications/${applicationId}/resume`;

    // 9. Save the application and prevent duplicate submissions.
    const result = await pool.query(
      `INSERT INTO applications (
         id,
         job_id,
         student_email,
         status,
         resume_name,
         resume_url
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (job_id, student_email) DO NOTHING
       RETURNING
         id,
         job_id,
         student_email,
         status,
         applied_at,
         resume_name,
         resume_url`,
      [
        applicationId,
        jobId,
        user.email.toLowerCase(),
        "Applied",
        resumeName,
        snapshotUrl,
      ]
    );

    if (result.rowCount === 0) {
      await unlink(snapshotPath).catch(() => {});
      snapshotPath = null;

      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    applicationSaved = true;
    snapshotPath = null;

    return NextResponse.json(
      {
        message: "Application submitted successfully.",
        application: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (snapshotPath && !applicationSaved) {
      await unlink(snapshotPath).catch(() => {});
    }

    console.error("Error submitting application:", error);

    return NextResponse.json(
      {
        error:
          "Unable to submit your application. Please check your resume and try again.",
      },
      { status: 500 }
    );
  }
}

// PATCH: Admins and recruiters who own the job can update application status.
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "Recruiter" && user.role !== "Admin") {
      return forbidden(
        "Only recruiters or admins can update application statuses."
      );
    }

    const body = await request.json();

    const applicationId =
      typeof body.applicationId === "string"
        ? body.applicationId.trim()
        : "";

    const status =
      typeof body.status === "string" ? body.status.trim() : "";

    if (!UUID_REGEX.test(applicationId)) {
      return NextResponse.json(
        { error: "Please provide a valid application ID." },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Please provide a valid application status." },
        { status: 400 }
      );
    }

    let query = `
      UPDATE applications AS a
      SET status = $1
      FROM jobs AS j
      WHERE a.id = $2
        AND j.id = a.job_id
    `;

    const values: unknown[] = [status, applicationId];

    if (user.role === "Recruiter") {
      query += ` AND j.recruiter_id = $3`;
      values.push(user.id);
    }

    query += `
      RETURNING
        a.id,
        a.job_id,
        a.student_email,
        a.status,
        a.applied_at,
        a.resume_name,
        a.resume_url
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          error:
            "Application not found or you do not have permission to update it.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Application status updated successfully.",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating application:", error);

    return NextResponse.json(
      { error: "Unable to update application status." },
      { status: 500 }
    );
  }
}