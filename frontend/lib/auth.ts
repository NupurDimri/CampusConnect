import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";

const SESSION_COOKIE = "campus_connect_session";

export type UserRole = "Student" | "Recruiter" | "Admin";

export interface SessionUser {
  id: string;
  role: UserRole;
  email: string;
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes.");
  }

  return new TextEncoder().encode(secret);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !["Student", "Recruiter", "Admin"].includes(payload.role as string)
    ) {
      return null;
    }

    const result = await pool.query(
      `SELECT id, email, role, is_active
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [payload.sub]
    );

    const user = result.rows[0];

    if (
      !user ||
      !user.is_active ||
      user.email !== payload.email ||
      user.role !== payload.role
    ) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

export async function hasRole(
  requiredRole: UserRole
): Promise<boolean> {
  const user = await getSessionUser();

  return user?.role === requiredRole;
}