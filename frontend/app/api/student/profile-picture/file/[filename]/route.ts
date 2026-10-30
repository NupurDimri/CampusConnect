import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";

const ALLOWED_EXTENSIONS: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Verify the logged-in user.
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to view this picture." },
        { status: 401 }
      );
    }

    if (user.role !== "Student") {
      return NextResponse.json(
        { error: "Only students can access this profile picture." },
        { status: 403 }
      );
    }

    // Get and validate the filename.
    const { filename } = await params;

    const match = filename.match(
      /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(jpg|png|webp)$/i
    );

    if (!match) {
      return NextResponse.json(
        { error: "Invalid profile picture filename." },
        { status: 400 }
      );
    }

    const extension = match[2].toLowerCase();
    const expectedUrl = `/api/student/profile-picture/file/${filename}`;

    // Ensure the picture belongs to the logged-in student.
    const result = await pool.query(
      `SELECT profile_picture_url
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [user.id]
    );

    if (
      !result.rows[0] ||
      result.rows[0].profile_picture_url !== expectedUrl
    ) {
      return NextResponse.json(
        { error: "Profile picture not found." },
        { status: 404 }
      );
    }

    // Read the uploaded image.
    const imagePath = path.join(
      process.cwd(),
      "uploads",
      "profile-pictures",
      filename
    );

    const imageBuffer = await readFile(imagePath);

    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": ALLOWED_EXTENSIONS[extension],
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Profile picture retrieval error:", error);

    return NextResponse.json(
      { error: "Unable to load the profile picture." },
      { status: 500 }
    );
  }
}