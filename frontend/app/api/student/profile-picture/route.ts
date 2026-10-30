import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import {pool} from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  let filePath: string | null = null;

  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to upload a profile picture." },
        { status: 401 }
      );
    }

    if (user.role !== "Student") {
      return NextResponse.json(
        { error: "Only student accounts can upload profile pictures." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("profilePicture");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a profile picture." },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The image must be smaller than 2 MB." },
        { status: 400 }
      );
    }

    const filename = `${randomUUID()}.${extension}`;
    const uploadDirectory = path.join(
      process.cwd(),
      "uploads",
      "profile-pictures"
    );

    await mkdir(uploadDirectory, { recursive: true });

    filePath = path.join(uploadDirectory, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const profilePictureUrl = `/api/student/profile-picture/file/${filename}`;

    const result = await pool.query(
      `UPDATE users
       SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id`,
      [profilePictureUrl, user.id]
    );

    if (result.rowCount === 0) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath).catch(() => {});
      return NextResponse.json(
        { error: "Student account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile picture uploaded successfully.",
        profilePictureUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile picture upload error:", error);

    if (filePath) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath).catch(() => {});
    }

    return NextResponse.json(
      { error: "Failed to upload profile picture. Please try again." },
      { status: 500 }
    );
  }
}