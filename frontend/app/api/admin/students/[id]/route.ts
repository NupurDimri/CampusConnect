import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function verifyAdmin() {
  const user = await getSessionUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "Admin") {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Only administrators can manage student accounts." },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

// UPDATE a student's details or account status.
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { user, response } = await verifyAdmin();

    if (response) return response;
    if (!user) return NextResponse.json(
      { message: "Unauthorized." },
      { status: 401 }
    );

    const { id } = await context.params;

    if (!id || id === String(user.id)) {
      return NextResponse.json(
        { message: "This student account cannot be modified through this request." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "full_name",
      "email",
      "college",
      "degree",
      "branch",
      "graduation_year",
      "phone",
      "location",
      "skills",
      "interests",
      "is_active",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No valid fields were provided to update." },
        { status: 400 }
      );
    }

    if (
      "full_name" in updates &&
      (typeof updates.full_name !== "string" ||
        !updates.full_name.trim())
    ) {
      return NextResponse.json(
        { message: "Student name cannot be empty." },
        { status: 400 }
      );
    }

    if ("email" in updates) {
      if (
        typeof updates.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email.trim())
      ) {
        return NextResponse.json(
          { message: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      updates.email = updates.email.trim().toLowerCase();
    }

    if ("college" in updates && updates.college !== null &&
        typeof updates.college !== "string") {
      return NextResponse.json(
        { message: "College must be text." },
        { status: 400 }
      );
    }

    if ("graduation_year" in updates) {
      const year = updates.graduation_year;

      if (
        year !== null &&
        year !== "" &&
        (!Number.isInteger(Number(year)) ||
          Number(year) < 1900 ||
          Number(year) > 2200)
      ) {
        return NextResponse.json(
          { message: "Please provide a valid graduation year." },
          { status: 400 }
        );
      }

      updates.graduation_year =
        year === "" || year === null ? null : Number(year);
    }

    if ("is_active" in updates && typeof updates.is_active !== "boolean") {
      return NextResponse.json(
        { message: "is_active must be true or false." },
        { status: 400 }
      );
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields
      .map((field, index) => `"${field}" = $${index + 1}`)
      .join(", ");

    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${setClause}, updated_at = NOW()
       WHERE id = $${values.length} AND role = 'Student'
       RETURNING
         id, full_name, email, college, degree, branch,
         graduation_year, phone, location, skills, interests,
         is_active, created_at`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Student updated successfully.",
      student: result.rows[0],
    });
  } catch (error: unknown) {
    const dbError = error as { code?: string };

    if (dbError.code === "23505") {
      return NextResponse.json(
        { message: "This email address is already registered." },
        { status: 409 }
      );
    }

    if (dbError.code === "22P02") {
      return NextResponse.json(
        { message: "One or more supplied values have an invalid format." },
        { status: 400 }
      );
    }

    console.error("Admin student update error:", error);

    return NextResponse.json(
      { message: "Unable to update the student." },
      { status: 500 }
    );
  }
}

// PERMANENTLY DELETE a student account.
// Deletion is refused if the student has associated applications.
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const client = await pool.connect();

  try {
    const { user, response } = await verifyAdmin();

    if (response) return response;
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id || id === String(user.id)) {
      return NextResponse.json(
        { message: "You cannot delete your own account through student management." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const studentResult = await client.query(
      `SELECT id FROM users
       WHERE id = $1 AND role = 'Student'
       FOR UPDATE`,
      [id]
    );

    if (studentResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    // Preserve application history. Do not delete a student who has
    // applications; deactivate their account instead.
    const applicationsResult = await client.query(
      `SELECT 1 FROM applications
       WHERE student_id = $1
       LIMIT 1`,
      [id]
    );

    if ((applicationsResult.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          message:
            "This student has application records. Deactivate the account instead to preserve application history.",
        },
        { status: 409 }
      );
    }

    await client.query(
      `DELETE FROM users WHERE id = $1 AND role = 'Student'`,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Student account deleted successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);

    console.error("Admin student deletion error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to delete this student. Check whether related records or database constraints prevent deletion.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}