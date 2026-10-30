import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
        { message: "You are not authorized to manage recruiter accounts." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const allowedFields = [
      "full_name",
      "email",
      "organization",
      "phone",
      "location",
      "is_active",
    ] as const;

    const updates: { column: string; value: unknown }[] = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates.push({ column: field, value: body[field] });
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No valid fields were provided to update." },
        { status: 400 }
      );
    }

    for (const update of updates) {
      if (
        ["full_name", "email", "organization", "phone", "location"].includes(
          update.column
        ) &&
        typeof update.value !== "string"
      ) {
        return NextResponse.json(
          { message: `Invalid value for ${update.column}.` },
          { status: 400 }
        );
      }
    }

    const name = updates.find((item) => item.column === "full_name")?.value;
    const email = updates.find((item) => item.column === "email")?.value;
    const active = updates.find((item) => item.column === "is_active")?.value;

    if (name !== undefined && !(name as string).trim()) {
      return NextResponse.json(
        { message: "Recruiter name cannot be empty." },
        { status: 400 }
      );
    }

    if (email !== undefined) {
      const normalizedEmail = (email as string).trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return NextResponse.json(
          { message: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      const emailUpdate = updates.find((item) => item.column === "email");
      if (emailUpdate) emailUpdate.value = normalizedEmail;
    }

    if (active !== undefined && typeof active !== "boolean") {
      return NextResponse.json(
        { message: "Account status must be active or inactive." },
        { status: 400 }
      );
    }

    const values = updates.map((item) =>
      typeof item.value === "string" &&
      ["full_name", "organization", "phone", "location"].includes(item.column)
        ? item.value.trim() || null
        : item.value
    );

    const setClause = updates
      .map((item, index) => `${item.column} = $${index + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE users
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length + 1}
         AND role = $${values.length + 2}
       RETURNING
         id,
         full_name,
         email,
         organization,
         phone,
         location,
         is_active,
         created_at`,
      [...values, id, "Recruiter"]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Recruiter not found." },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    return NextResponse.json({
      message: "Recruiter updated successfully.",
      recruiter: {
        id: String(row.id),
        name: row.full_name,
        email: row.email,
        company: row.organization || "Not provided",
        phone: row.phone || "Not provided",
        location: row.location || "Not provided",
        status: row.is_active ? "Active" : "Inactive",
        joinedDate: row.created_at
          ? new Date(row.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Not available",
      },
    });
  } catch (error: unknown) {
    const dbError = error as { code?: string };

    if (dbError.code === "23505") {
      return NextResponse.json(
        { message: "This email address is already registered." },
        { status: 409 }
      );
    }

    console.error("Update recruiter API error:", error);

    return NextResponse.json(
      { message: "Unable to update recruiter." },
      { status: 500 }
    );
  }
}