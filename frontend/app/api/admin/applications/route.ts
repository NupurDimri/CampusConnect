import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    // Verify that the user is logged in
    const currentUser = await getSessionUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Only Admin can access this API
    if (currentUser.role !== "Admin") {
      return NextResponse.json(
        { message: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    // Fetch applications using the actual database column names
    const result = await pool.query(`
      SELECT
        a.id,
        a.job_id,
        a.student_email,
        a.status,
        a.applied_at,

        u.full_name AS student_name,
        u.email AS student_email_address,
        u.college,
        u.degree,
        u.branch,

        j.title AS job_title,
        j.company,
        j.location

      FROM applications a

      LEFT JOIN users u
        ON LOWER(TRIM(u.email)) = LOWER(TRIM(a.student_email))

      LEFT JOIN jobs j
        ON j.id::text = a.job_id::text

      ORDER BY a.applied_at DESC NULLS LAST
    `);

    const applications = result.rows.map((row) => ({
      id: String(row.id),
      studentId: row.student_email,
      studentName: row.student_name || "Unknown Student",
      studentEmail: row.student_email,
      college: row.college || "Not provided",
      degree: row.degree || "",
      branch: row.branch || "",
      jobId: String(row.job_id),
      jobTitle: row.job_title || "Job Not Found",
      company: row.company || "Unknown Company",
      location: row.location || "Not provided",
      status: row.status || "Pending",
      appliedAt: row.applied_at,
      appliedDate: row.applied_at
        ? new Date(row.applied_at).toLocaleDateString("en-IN")
        : "Not available",
    }));

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Admin applications GET error:", error);

    return NextResponse.json(
      { message: "Failed to load applications." },
      { status: 500 }
    );
  }
}