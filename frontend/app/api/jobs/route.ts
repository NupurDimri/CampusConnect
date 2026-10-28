import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

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

export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (
      !title?.trim() ||
      !company?.trim() ||
      !location?.trim() ||
      !jobType ||
      !workMode ||
      !description?.trim()
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const id = randomUUID();

    const result = await pool.query(
      `INSERT INTO jobs (
        id, title, company, department, location,
        job_type, work_mode, salary, deadline,
        description, responsibilities, eligibility,
        skills, status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14
      )
      RETURNING *`,
      [
        id,
        title.trim(),
        company.trim(),
        department || null,
        location.trim(),
        jobType,
        workMode,
        salary || null,
        deadline || null,
        description.trim(),
        responsibilities || null,
        eligibility || null,
        skills || null,
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