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
        { message: "You are not authorized to view recruiter records." },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT
        id,
        full_name,
        email,
        organization,
        phone,
        location,
        is_active,
        created_at
      FROM users
      WHERE role = $1
      ORDER BY created_at DESC`,
      ["Recruiter"]
    );

    const recruiters = result.rows.map((row) => ({
      id: String(row.id),
      name: row.full_name,
      email: row.email,
      company: row.organization || "Not provided",
      phone: row.phone || "Not provided",
      location: row.location || "Not provided",
      status: row.is_active ? "Active" : "Inactive",
      joinedDate: row.created_at
        ? new Date(row.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not available",
    }));

    return NextResponse.json({ recruiters });
  } catch (error) {
    console.error("Admin recruiters API error:", error);

    return NextResponse.json(
      { message: "Unable to load recruiter records." },
      { status: 500 }
    );
  }
}