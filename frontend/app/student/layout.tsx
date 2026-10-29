import { Suspense } from "react";
import { requireRole } from "@/lib/require-role";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Verifying your session...</p>
        </div>
      }
    >
      <ProtectedStudentContent>{children}</ProtectedStudentContent>
    </Suspense>
  );
}

async function ProtectedStudentContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("Student");

  return <>{children}</>;
}