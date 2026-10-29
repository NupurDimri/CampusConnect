import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const role = body.role;

    const organization =
      typeof body.organization === "string"
        ? body.organization.trim()
        : "";

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Validate name
    if (fullName.length > 150) {
      return NextResponse.json(
        { message: "Name cannot exceed 150 characters." },
        { status: 400 }
      );
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email) || email.length > 255) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { message: "Password must contain between 8 and 72 characters." },
        { status: 400 }
      );
    }

    // Public registration must never create Admin accounts
    if (role !== "Student" && role !== "Recruiter") {
      return NextResponse.json(
        { message: "Invalid account type." },
        { status: 400 }
      );
    }

    // Recruiters must provide their company name
    if (role === "Recruiter" && !organization) {
      return NextResponse.json(
        { message: "Company name is required for recruiters." },
        { status: 400 }
      );
    }

    if (organization.length > 200) {
      return NextResponse.json(
        { message: "Company name cannot exceed 200 characters." },
        { status: 400 }
      );
    }

    // Check whether the email is already registered
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Never store the original password
    const passwordHash = await bcrypt.hash(password, 12);

    // Save the new user
    const result = await pool.query(
      `INSERT INTO users
        (full_name, email, password_hash, role, organization)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, organization, created_at`,
      [
        fullName,
        email,
        passwordHash,
        role,
        role === "Recruiter" ? organization : null,
      ]
    );

    return NextResponse.json(
      {
        message: "Your account has been created successfully.",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Handle duplicate email in case two requests arrive together
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}