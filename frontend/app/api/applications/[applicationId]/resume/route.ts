import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to access this resume." },
        { status: 401 }
      );
    }

    if (
      user.role !== "Student" &&
      user.role !== "Recruiter" &&
      user.role !== "Admin"
    ) {
      return NextResponse.json(
        { error: "You do not have permission to access this resume." },
        { status: 403 }
      );
    }

    const { applicationId } = await params;
    const normalizedId = applicationId?.trim();

    console.log("Received application ID:", JSON.stringify(applicationId));
    console.log("UUID validation result:", UUID_REGEX.test(normalizedId ?? ""));

    if (!normalizedId || !UUID_REGEX.test(normalizedId)) {
      return NextResponse.json(
        {
          error: "Invalid application ID.",
          receivedId: applicationId,
        },
        { status: 400 }
      );
    }

    let query = `
      SELECT
        a.id,
        a.student_email,
        a.resume_name,
        a.resume_url,
        j.recruiter_id
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      WHERE a.id = $1
    `;

    const values: unknown[] = [normalizedId];

    if (user.role === "Student") {
      query += ` AND LOWER(a.student_email) = LOWER($2)`;
      values.push(user.email);
    } else if (user.role === "Recruiter") {
      query += ` AND j.recruiter_id = $2`;
      values.push(user.id);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Application not found or you do not have permission to access its resume.",
        },
        { status: 404 }
      );
    }

    const application = result.rows[0];

    if (!application.resume_name || !application.resume_url) {
      return NextResponse.json(
        { error: "No resume is attached to this application." },
        { status: 404 }
      );
    }

    const expectedUrl = `/api/applications/${application.id}/resume`;

    if (application.resume_url !== expectedUrl) {
      return NextResponse.json(
        { error: "The resume reference is invalid." },
        { status: 404 }
      );
    }

    const originalFilename = path.basename(
      String(application.resume_name)
    );

    const extension = path.extname(originalFilename).toLowerCase();

    const contentTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const contentType = contentTypes[extension];

    if (!contentType) {
      return NextResponse.json(
        { error: "Unsupported resume file type." },
        { status: 400 }
      );
    }

    const snapshotFilename = `${application.id}${extension}`;

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "application-resumes",
      snapshotFilename
    );

    let fileBuffer: Buffer;

    try {
      fileBuffer = await readFile(filePath);
    } catch (error) {
      console.error("Application resume file not found:", error);

      return NextResponse.json(
        {
          error:
            "The submitted resume file could not be found. Check the application-resumes folder.",
        },
        { status: 404 }
      );
    }

    const safeFilename = originalFilename.replace(/["\r\n]/g, "_");

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error retrieving application resume:", error);

    return NextResponse.json(
      { error: "Unable to retrieve this resume." },
      { status: 500 }
    );
  }
}