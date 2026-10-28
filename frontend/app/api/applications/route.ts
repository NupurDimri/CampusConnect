import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const jobId =
      typeof body.jobId === "string" ? body.jobId.trim() : "";

    const studentEmail =
      typeof body.studentEmail === "string"
        ? body.studentEmail.trim().toLowerCase()
        : "";

    // Validate the job ID.
    if (!UUID_REGEX.test(jobId)) {
      return NextResponse.json(
        { error: "Please provide a valid job ID." },
        { status: 400 }
      );
    }

    // Validate the student email.
    if (!EMAIL_REGEX.test(studentEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid student email address." },
        { status: 400 }
      );
    }

    // Make sure the job exists and is accepting applications.
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

    // Reject applications after the deadline.
    if (
      job.deadline &&
      new Date(job.deadline).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "The application deadline has passed." },
        { status: 400 }
      );
    }

    // Save the application.
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

    // The unique database constraint prevents duplicate applications.
    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          error: "You have already applied for this job.",
        },
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