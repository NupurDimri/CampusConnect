import { redirect } from "next/navigation";
import { getSessionUser, type UserRole } from "@/lib/auth";

export async function requireRole(requiredRole: UserRole) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== requiredRole) {
    const destination =
      user.role === "Student"
        ? "/student"
        : user.role === "Recruiter"
          ? "/recruiter"
          : "/admin";

    redirect(destination);
  }

  return user;
}