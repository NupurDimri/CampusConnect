import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getSessionUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "Admin") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       WHERE id::text = $1::text
       LIMIT 1`,
      [currentUser.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Admin account not found." },
        { status: 404 }
      );
    }

    const admin = result.rows[0];

    return NextResponse.json({
      admin: {
        id: String(admin.id),
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.created_at,
      },
    });
  } catch (error) {
    console.error("Admin settings GET error:", error);

    return NextResponse.json(
      { message: "Failed to load admin settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getSessionUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "Admin") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (fullName.length < 2 || fullName.length > 100) {
      return NextResponse.json(
        { message: "Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1,
           email = $2,
           updated_at = NOW()
       WHERE id::text = $3::text
       RETURNING id, full_name, email, role, created_at`,
      [fullName, email, currentUser.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Admin account not found." },
        { status: 404 }
      );
    }

    const admin = result.rows[0];

    return NextResponse.json({
      message: "Profile updated successfully.",
      admin: {
        id: String(admin.id),
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.created_at,
      },
    });
  } catch (error: unknown) {
    const dbError = error as { code?: string };

    if (dbError.code === "23505") {
      return NextResponse.json(
        { message: "This email address is already in use." },
        { status: 409 }
      );
    }

    console.error("Admin settings PATCH error:", error);

    return NextResponse.json(
      { message: "Failed to update admin profile." },
      { status: 500 }
    );
  }
}