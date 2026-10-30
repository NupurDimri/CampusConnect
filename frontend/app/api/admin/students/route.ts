import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    // Verify that the requester is an authenticated administrator.
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (user.role !== "Admin") {
      return NextResponse.json(
        { message: "You are not authorized to view student records." },
        { status: 403 }
      );
    }

    // Fetch actual student accounts only.
    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         college,
         degree,
         branch,
         graduation_year,
         is_active,
         created_at
       FROM users
       WHERE role = $1
       ORDER BY created_at DESC`,
      ["Student"]
    );

    const students = result.rows.map((row) => ({
      id: String(row.id),
      name: row.full_name,
      email: row.email,
      course: [row.degree, row.branch].filter(Boolean).join(" - ") || "Not provided",
      college: row.college || "Not provided",
      graduationYear: row.graduation_year
        ? Number(row.graduation_year)
        : null,
      status: row.is_active ? "Active" : "Inactive",
      joinedDate: row.created_at
        ? new Date(row.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not available",
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Admin students API error:", error);

    return NextResponse.json(
      { message: "Unable to load student records." },
      { status: 500 }
    );
  }
}