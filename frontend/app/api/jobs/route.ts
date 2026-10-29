import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const VALID_STATUSES = ["Active", "Draft", "Closed"];

const VALID_JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
];

const VALID_WORK_MODES = ["On-site", "Remote", "Hybrid"];

function isValidUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function unauthorized() {
  return NextResponse.json(
    { error: "Please log in to continue." },
    { status: 401 }
  );
}

function forbidden() {
  return NextResponse.json(
    { error: "You do not have permission to perform this action." },
    { status: 403 }
  );
}

// GET: Public job listings.
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        id,
        title,
        company,
        department,
        location,
        job_type,
        work_mode,
        salary,
        deadline,
        description,
        responsibilities,
        eligibility,
        skills,
        status,
        applicants,
        created_at
      FROM jobs
      ORDER BY created_at DESC`
    );

    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    console.error("Error fetching jobs:", error);

    return NextResponse.json(
      { error: "Unable to load jobs from the database." },
      { status: 500 }
    );
  }
}

// POST: Only authenticated recruiters can create jobs.
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "Recruiter") {
      return forbidden();
    }

    const body = await request.json();

    const {
      title,
      company,
      department,
      location,
      jobType,
      workMode,
      salary,
      deadline,
      description,
      responsibilities,
      eligibility,
      skills,
      status,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof company !== "string" ||
      !company.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof jobType !== "string" ||
      !VALID_JOB_TYPES.includes(jobType) ||
      typeof workMode !== "string" ||
      !VALID_WORK_MODES.includes(workMode) ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "Please provide valid values for all required fields." },
        { status: 400 }
      );
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid job status." },
        { status: 400 }
      );
    }

    const id = randomUUID();

    const result = await pool.query(
      `INSERT INTO jobs (
        id,
        recruiter_id,
        title,
        company,
        department,
        location,
        job_type,
        work_mode,
        salary,
        deadline,
        description,
        responsibilities,
        eligibility,
        skills,
        status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING *`,
      [
        id,
        user.id,
        title.trim(),
        company.trim(),
        typeof department === "string" && department.trim()
          ? department.trim()
          : null,
        location.trim(),
        jobType,
        workMode,
        typeof salary === "string" && salary.trim()
          ? salary.trim()
          : null,
        deadline || null,
        description.trim(),
        typeof responsibilities === "string" && responsibilities.trim()
          ? responsibilities.trim()
          : null,
        typeof eligibility === "string" && eligibility.trim()
          ? eligibility.trim()
          : null,
        typeof skills === "string" && skills.trim()
          ? skills.trim()
          : null,
        status || "Active",
      ]
    );

    return NextResponse.json(
      {
        message: "Job saved successfully!",
        job: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving job:", error);

    return NextResponse.json(
      { error: "Unable to save job. Please try again." },
      { status: 500 }
    );
  }
}

// PATCH: The owning recruiter or an admin can update a job.
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "Recruiter" && user.role !== "Admin") {
      return forbidden();
    }

    const body = await request.json();

    const {
      id,
      title,
      company,
      department,
      location,
      jobType,
      workMode,
      salary,
      deadline,
      description,
      responsibilities,
      eligibility,
      skills,
      status,
    } = body;

    if (typeof id !== "string" || !isValidUUID(id)) {
      return NextResponse.json(
        { error: "A valid job ID is required." },
        { status: 400 }
      );
    }

    // A recruiter may update only their own job.
    const existingResult =
      user.role === "Admin"
        ? await pool.query(
            `SELECT * FROM jobs WHERE id = $1`,
            [id]
          )
        : await pool.query(
            `SELECT * FROM jobs
             WHERE id = $1 AND recruiter_id = $2`,
            [id, user.id]
          );

    if (existingResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Job not found or you do not have permission to update it." },
        { status: 404 }
      );
    }

    const existing = existingResult.rows[0];

    const updated = {
      title: title === undefined ? existing.title : title,
      company: company === undefined ? existing.company : company,
      department:
        department === undefined ? existing.department : department,
      location: location === undefined ? existing.location : location,
      jobType: jobType === undefined ? existing.job_type : jobType,
      workMode: workMode === undefined ? existing.work_mode : workMode,
      salary: salary === undefined ? existing.salary : salary,
      deadline: deadline === undefined ? existing.deadline : deadline,
      description:
        description === undefined ? existing.description : description,
      responsibilities:
        responsibilities === undefined
          ? existing.responsibilities
          : responsibilities,
      eligibility:
        eligibility === undefined ? existing.eligibility : eligibility,
      skills: skills === undefined ? existing.skills : skills,
      status: status === undefined ? existing.status : status,
    };

    if (
      typeof updated.title !== "string" ||
      !updated.title.trim() ||
      typeof updated.company !== "string" ||
      !updated.company.trim() ||
      typeof updated.location !== "string" ||
      !updated.location.trim() ||
      typeof updated.jobType !== "string" ||
      !VALID_JOB_TYPES.includes(updated.jobType) ||
      typeof updated.workMode !== "string" ||
      !VALID_WORK_MODES.includes(updated.workMode) ||
      typeof updated.description !== "string" ||
      !updated.description.trim()
    ) {
      return NextResponse.json(
        { error: "Please provide valid values for all required fields." },
        { status: 400 }
      );
    }

    if (
      typeof updated.status !== "string" ||
      !VALID_STATUSES.includes(updated.status)
    ) {
      return NextResponse.json(
        { error: "Invalid job status." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE jobs
       SET
         title = $1,
         company = $2,
         department = $3,
         location = $4,
         job_type = $5,
         work_mode = $6,
         salary = $7,
         deadline = $8,
         description = $9,
         responsibilities = $10,
         eligibility = $11,
         skills = $12,
         status = $13
       WHERE id = $14
       RETURNING *`,
      [
        updated.title.trim(),
        updated.company.trim(),
        typeof updated.department === "string" && updated.department.trim()
          ? updated.department.trim()
          : null,
        updated.location.trim(),
        updated.jobType,
        updated.workMode,
        updated.salary || null,
        updated.deadline || null,
        updated.description.trim(),
        updated.responsibilities || null,
        updated.eligibility || null,
        updated.skills || null,
        updated.status,
        id,
      ]
    );

    return NextResponse.json({
      message: "Job updated successfully.",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating job:", error);

    return NextResponse.json(
      { error: "Unable to update the job. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE: The owning recruiter or an admin can delete a job.
export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "Recruiter" && user.role !== "Admin") {
      return forbidden();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: "A valid job ID is required." },
        { status: 400 }
      );
    }

    const result =
      user.role === "Admin"
        ? await pool.query(
            `DELETE FROM jobs
             WHERE id = $1
             RETURNING id, title`,
            [id]
          )
        : await pool.query(
            `DELETE FROM jobs
             WHERE id = $1 AND recruiter_id = $2
             RETURNING id, title`,
            [id, user.id]
          );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Job not found or you do not have permission to delete it." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Job deleted successfully.",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting job:", error);

    return NextResponse.json(
      {
        error:
          "Unable to delete the job. Check whether related database records prevent deletion.",
      },
      { status: 500 }
    );
  }
}