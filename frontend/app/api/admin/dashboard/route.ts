import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getSessionUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Please log in." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "Admin") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    // Count actual student accounts.
    const studentsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM users
      WHERE role = 'Student'
    `);

    // Count actual recruiter accounts.
    const recruitersResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM users
      WHERE role = 'Recruiter'
    `);

    // Count active jobs whose deadline has not passed.
    const jobsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM jobs
      WHERE LOWER(status::text) = 'active'
        AND (deadline IS NULL OR deadline >= CURRENT_DATE)
    `);

    // Count actual submitted applications.
    const applicationsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM applications
    `);

    // Load recent student registrations.
    const studentsActivity = await pool.query(`
      SELECT
        full_name AS name,
        'New student registration' AS title,
        'Student account registered' AS description,
        created_at AS activity_date,
        'student' AS activity_type
      FROM users
      WHERE role = 'Student'
      ORDER BY created_at DESC NULLS LAST
      LIMIT 5
    `);

    // Load recent recruiter registrations.
    const recruitersActivity = await pool.query(`
      SELECT
        full_name AS name,
        'New recruiter registration' AS title,
        'Recruiter account registered' AS description,
        created_at AS activity_date,
        'recruiter' AS activity_type
      FROM users
      WHERE role = 'Recruiter'
      ORDER BY created_at DESC NULLS LAST
      LIMIT 5
    `);

    // Load recent applications using the actual schema.
    const applicationsActivity = await pool.query(`
      SELECT
        a.student_email AS name,
        'New application' AS title,
        COALESCE(j.title, 'Unknown job') || ' at ' ||
          COALESCE(j.company, 'Unknown company') AS description,
        a.applied_at AS activity_date,
        'application' AS activity_type
      FROM applications a
      LEFT JOIN jobs j
        ON j.id::text = a.job_id::text
      ORDER BY a.applied_at DESC NULLS LAST
      LIMIT 5
    `);

    // Combine activity records from the three sources.
    const recentActivity = [
      ...studentsActivity.rows,
      ...recruitersActivity.rows,
      ...applicationsActivity.rows,
    ]
      .sort((a, b) => {
        const dateA = a.activity_date
          ? new Date(a.activity_date).getTime()
          : 0;

        const dateB = b.activity_date
          ? new Date(b.activity_date).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 6)
      .map((activity) => ({
        title: activity.title,
        description: `${activity.name || "Unknown user"} — ${activity.description}`,
        time: activity.activity_date
          ? new Date(activity.activity_date).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "Date unavailable",
        type: activity.activity_type,
      }));

    return NextResponse.json({
      stats: {
        students: studentsResult.rows[0].total,
        recruiters: recruitersResult.rows[0].total,
        jobs: jobsResult.rows[0].total,
        applications: applicationsResult.rows[0].total,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Admin dashboard GET error:", error);

    return NextResponse.json(
      { message: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}