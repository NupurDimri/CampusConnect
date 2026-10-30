import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export async function POST(request: Request) {
  try {
    // 1. Check login
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Please log in before uploading your resume." },
        { status: 401 }
      );
    }

    // 2. Only students can upload resumes
    if (sessionUser.role !== "Student") {
      return NextResponse.json(
        { message: "Only students can upload a resume." },
        { status: 403 }
      );
    }

    // 3. Read the uploaded file
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { message: "Please select a resume file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Resume size must not exceed 5 MB." },
        { status: 400 }
      );
    }

    // 4. Validate file type and extension
    const extension = path.extname(file.name).toLowerCase();
    const allowedExtensions = ALLOWED_TYPES[file.type];

    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { message: "Only PDF, DOC, and DOCX resumes are allowed." },
        { status: 400 }
      );
    }

    // 5. Create a unique server-side filename
    const storedFilename = `${randomUUID()}${extension}`;
    const uploadDirectory = path.join(
      process.cwd(),
      "uploads",
      "resumes"
    );

    await mkdir(uploadDirectory, { recursive: true });

    const filePath = path.join(uploadDirectory, storedFilename);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, fileBuffer, { flag: "wx" });

    // 6. Save the filename and URL in the current student's database row
    const resumeUrl = `/api/student/resume/file/${storedFilename}`;

    const result = await pool.query(
      `UPDATE users
       SET resume_name = $1,
           resume_url = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
         AND role = 'Student'
         AND is_active = TRUE
       RETURNING resume_name, resume_url`,
      [file.name, resumeUrl, sessionUser.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Resume uploaded and saved successfully.",
      resumeName: result.rows[0].resume_name,
      resumeUrl: result.rows[0].resume_url,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return NextResponse.json(
      { message: "Unable to upload your resume right now." },
      { status: 500 }
    );
  }
}