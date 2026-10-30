import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedStatuses = [
  "Pending",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

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
        { message: "You are not authorized to update applications." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    if (
      typeof body.status !== "string" ||
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        {
          message: "Invalid status.",
          allowedStatuses,
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE applications
       SET status = $1
       WHERE id::text = $2
       RETURNING id, status`,
      [body.status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Application status updated successfully.",
      application: {
        id: String(result.rows[0].id),
        status: result.rows[0].status,
      },
    });
  } catch (error) {
    console.error("Admin application PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update the application status." },
      { status: 500 }
    );
  }
}