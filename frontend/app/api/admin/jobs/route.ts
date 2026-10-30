import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
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
        { message: "You are not authorized to view job records." },
        { status: 403 }
      );
    }

    const result = await pool.query(`
      SELECT
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
        status
      FROM jobs
      ORDER BY deadline DESC NULLS LAST
    `);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const jobs = result.rows.map((row) => {
      const deadline = row.deadline
        ? new Date(row.deadline)
        : null;

      if (deadline) {
        deadline.setHours(0, 0, 0, 0);
      }

      const isExpired = deadline !== null && deadline < today;

      return {
        id: String(row.id),
        title: row.title,
        company: row.company,
        department: row.department || "",
        location: row.location,
        jobType: row.job_type || "",
        workMode: row.work_mode || "",
        salary: row.salary ?? "",
        deadline: row.deadline
          ? new Date(row.deadline).toISOString().slice(0, 10)
          : "",
        description: row.description || "",
        responsibilities: row.responsibilities || "",
        eligibility: row.eligibility || "",
        skills: row.skills || "",
        status: row.status || "Inactive",
        isExpired,
      };
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Admin jobs GET error:", error);

    return NextResponse.json(
      { message: "Unable to load jobs. Please check the database schema." },
      { status: 500 }
    );
  }
}