import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";

function emptyToNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function profileResponse(user: Record<string, unknown>) {
  return {
    fullName: user.full_name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    location: user.location ?? "",
    college: user.college ?? "",
    degree: user.degree ?? "",
    branch: user.branch ?? "",
    graduationYear:
      user.graduation_year == null ? "" : String(user.graduation_year),
    cgpa: user.cgpa == null ? "" : String(user.cgpa),
    skills: user.skills ?? "",
    interests: user.interests ?? "",
    resumeName: user.resume_name ?? "",
    resumeUrl: user.resume_url ?? "",
    profilePictureUrl: user.profile_picture_url ?? "",
  };
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Please log in to view your profile." },
        { status: 401 }
      );
    }

    if (sessionUser.role !== "Student") {
      return NextResponse.json(
        { message: "This endpoint is available only to students." },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         phone,
         location,
         college,
         degree,
         branch,
         graduation_year,
         cgpa,
         skills,
         interests,
         resume_name,
         resume_url,
         profile_picture_url
       FROM users
       WHERE id = $1
         AND role = 'Student'
         AND is_active = TRUE
       LIMIT 1`,
      [sessionUser.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: profileResponse(result.rows[0]),
    });
  } catch (error) {
    console.error("GET student profile error:", error);

    return NextResponse.json(
      { message: "Unable to load your profile right now." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Please log in before saving your profile." },
        { status: 401 }
      );
    }

    if (sessionUser.role !== "Student") {
      return NextResponse.json(
        { message: "Only students can update student profile details." },
        { status: 403 }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { message: "Invalid profile data." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const fullName = emptyToNull(data.fullName);

    if (!fullName) {
      return NextResponse.json(
        { message: "Full name is required." },
        { status: 400 }
      );
    }

    if (fullName.length > 150) {
      return NextResponse.json(
        { message: "Full name must not exceed 150 characters." },
        { status: 400 }
      );
    }

    const phone = emptyToNull(data.phone);
    const location = emptyToNull(data.location);
    const college = emptyToNull(data.college);
    const degree = emptyToNull(data.degree);
    const branch = emptyToNull(data.branch);
    const skills = emptyToNull(data.skills);
    const interests = emptyToNull(data.interests);

    const yearText = emptyToNull(data.graduationYear);
    const cgpaText = emptyToNull(data.cgpa);

    let graduationYear: number | null = null;
    let cgpa: number | null = null;

    if (yearText !== null) {
      graduationYear = Number(yearText);

      if (
        !Number.isInteger(graduationYear) ||
        graduationYear < 1900 ||
        graduationYear > 2200
      ) {
        return NextResponse.json(
          { message: "Please enter a valid graduation year." },
          { status: 400 }
        );
      }
    }

    if (cgpaText !== null) {
      cgpa = Number(cgpaText);

      if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
        return NextResponse.json(
          { message: "CGPA must be between 0 and 10." },
          { status: 400 }
        );
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET
         full_name = $1,
         phone = $2,
         location = $3,
         college = $4,
         degree = $5,
         branch = $6,
         graduation_year = $7,
         cgpa = $8,
         skills = $9,
         interests = $10,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
         AND role = 'Student'
         AND is_active = TRUE
       RETURNING
         id,
         full_name,
         email,
         phone,
         location,
         college,
         degree,
         branch,
         graduation_year,
         cgpa,
         skills,
         interests,
         resume_name,
         resume_url,
         profile_picture_url`,
      [
        fullName,
        phone,
        location,
        college,
        degree,
        branch,
        graduationYear,
        cgpa,
        skills,
        interests,
        sessionUser.id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile saved successfully.",
      profile: profileResponse(result.rows[0]),
    });
  } catch (error) {
    console.error("PUT student profile error:", error);

    return NextResponse.json(
      { message: "Unable to save your profile right now." },
      { status: 500 }
    );
  }
}