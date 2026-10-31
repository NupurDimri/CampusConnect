import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { pool } from "@/lib/db";

const SESSION_COOKIE = "campus_connect_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

const VALID_ROLES = ["Student", "Recruiter", "Admin"] as const;

type UserRole = (typeof VALID_ROLES)[number];

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes.");
  }

  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const requestedRole =
      typeof body.role === "string" ? body.role : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Please enter your email and password." },
        { status: 400 }
      );
    }

    if (
      !VALID_ROLES.includes(requestedRole as UserRole)
    ) {
      return NextResponse.json(
        { message: "Please select a valid account type." },
        { status: 400 }
      );
    }

    // Find the account in PostgreSQL.
    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         password_hash,
         role,
         organization,
         is_active
       FROM users
       WHERE LOWER(TRIM(email)) = $1
       LIMIT 1`,
      [email]
    );

    const user = result.rows[0];

    // Use a generic error for invalid credentials.
    if (
      !user ||
      typeof user.password_hash !== "string" ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        {
          message:
            "Your account has been disabled. Please contact support.",
        },
        { status: 403 }
      );
    }

    if (!VALID_ROLES.includes(user.role as UserRole)) {
      return NextResponse.json(
        { message: "This account has an invalid role." },
        { status: 403 }
      );
    }

    // Verify the selected tab BEFORE creating a session.
    if (user.role !== requestedRole) {
      return NextResponse.json(
        {
          message: `Your account is registered as ${user.role}. Please select the ${user.role} login tab.`,
        },
        { status: 403 }
      );
    }

    // Create a signed session only after all checks succeed.
    const token = await new SignJWT({
      role: user.role,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.id))
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION}s`)
      .sign(getSessionSecret());

    const redirectTo =
      user.role === "Student"
        ? "/student"
        : user.role === "Recruiter"
          ? "/recruiter"
          : "/admin";

    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
      redirectTo,
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Unable to sign in. Please try again." },
      { status: 500 }
    );
  }
}