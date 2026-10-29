import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
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

function unauthorized() {
  return NextResponse.json(
    { error: "Please log in to continue." },
    { status: 401 }
  );
}

function forbidden(message = "You do not have permission to perform this action.") {
  return NextResponse.json({ error: message }, { status: 403 });
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

    // Recruiter: retrieve applicants for a job they own.
    if (jobId) {
      if (user.role !== "Recruiter" && user.role !== "Admin") {
        return forbidden("Only recruiters or admins can view job applicants.");
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

      // Verify job ownership for recruiters.
      if (user.role === "Recruiter") {
        query += ` AND j.recruiter_id = $2`;
        values.push(user.id);
      }

      query += ` ORDER BY a.applied_at DESC`;

      const result = await pool.query(query, values);

      return NextResponse.json(result.rows);
    }

    // Students can only retrieve their own applications.
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

    // Recruiters and admins may not use the student list endpoint
    // to access arbitrary student application records.
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

// POST: An authenticated student applies for a job.
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "Student") {
      return forbidden("Only students can apply for jobs.");
    }

    const body = await request.json();

    const jobId =
      typeof body.jobId === "string" ? body.jobId.trim() : "";

    // Always use the verified user's email.
    // Never trust a studentEmail supplied by the browser.
    const studentEmail = user.email.toLowerCase();

    if (!UUID_REGEX.test(jobId)) {
      return NextResponse.json(
        { error: "Please provide a valid job ID." },
        { status: 400 }
      );
    }

    const jobResult = await pool.query(
      `SELECT id, status, deadline
       FROM jobs
       WHERE id = $1`,
      [jobId]
    );

    if (jobResult.rowCount === 0) {
      return NextResponse.json(
        { error: "This job does not exist." },
        { status: 404 }
      );
    }

    const job = jobResult.rows[0];

    if (job.status !== "Active") {
      return NextResponse.json(
        { error: "This job is not currently accepting applications." },
        { status: 400 }
      );
    }

    if (
      job.deadline &&
      new Date(job.deadline).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "The application deadline has passed." },
        { status: 400 }
      );
    }

    const applicationId = randomUUID();

    const result = await pool.query(
      `INSERT INTO applications (
         id,
         job_id,
         student_email,
         status
       )
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (job_id, student_email) DO NOTHING
       RETURNING id, job_id, student_email, status, applied_at`,
      [applicationId, jobId, studentEmail, "Applied"]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully.",
        application: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting application:", error);

    return NextResponse.json(
      { error: "Unable to submit your application. Please try again." },
      { status: 500 }
    );
  }
}

// PATCH: Only an admin or the recruiter who owns the job
// can update an application's status.
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "Recruiter" && user.role !== "Admin") {
      return forbidden("Only recruiters or admins can update application statuses.");
    }

    const body = await request.json();

    const applicationId =
      typeof body.applicationId === "string"
        ? body.applicationId.trim()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status.trim()
        : "";

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
      RETURNING a.id, a.job_id, a.student_email, a.status, a.applied_at
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Application not found or you do not have permission to update it." },
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