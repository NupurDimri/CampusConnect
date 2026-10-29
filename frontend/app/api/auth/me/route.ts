import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "You are not logged in." },
        { status: 401 }
      );
    }

    // Fetch the current account from the database so that
    // changes to the account or role are reflected immediately.
    const result = await pool.query(
      `SELECT id, full_name, email, role, organization, is_active
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [sessionUser.id]
    );

    const user = result.rows[0];

    if (!user || !user.is_active || user.role !== sessionUser.role) {
      const response = NextResponse.json(
        { message: "Your session is no longer valid." },
        { status: 401 }
      );

      response.cookies.set("campus_connect_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve your account." },
      { status: 500 }
    );
  }
}