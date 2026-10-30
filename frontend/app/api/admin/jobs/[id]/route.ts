import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedFields: Record<string, string> = {
  title: "title",
  company: "company",
  department: "department",
  location: "location",
  jobType: "job_type",
  workMode: "work_mode",
  salary: "salary",
  deadline: "deadline",
  description: "description",
  responsibilities: "responsibilities",
  eligibility: "eligibility",
  skills: "skills",
  status: "status",
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (user.role !== "Admin") {
      return NextResponse.json(
        { message: "You are not authorized to modify jobs." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const updates: Array<{ column: string; value: unknown }> = [];

    for (const [key, column] of Object.entries(allowedFields)) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates.push({ column, value: body[key] });
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No valid fields were provided." },
        { status: 400 }
      );
    }

    const values = updates.map((item) => item.value);
    const assignments = updates.map(
      (item, index) => `${item.column} = $${index + 1}`
    );

    values.push(id);

    const result = await pool.query(
      `UPDATE jobs
       SET ${assignments.join(", ")}
       WHERE id::text = $${values.length}
       RETURNING
         id, title, company, department, location,
         job_type, work_mode, salary, deadline,
         description, responsibilities, eligibility,
         skills, status`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Job updated successfully.",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Admin job PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update the job." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (user.role !== "Admin") {
      return NextResponse.json(
        { message: "You are not authorized to delete jobs." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Check for linked applications before deleting a job.
    const applications = await pool.query(
      `SELECT 1
       FROM applications
       WHERE job_id::text = $1
       LIMIT 1`,
      [id]
    );

    if (applications.rows.length > 0) {
      return NextResponse.json(
        {
          message:
            "This job has applications linked to it. Deactivate the job instead of deleting it.",
        },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `DELETE FROM jobs
       WHERE id::text = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error("Admin job DELETE error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to delete the job. Check the jobs and applications table relationships.",
      },
      { status: 500 }
    );
  }
}