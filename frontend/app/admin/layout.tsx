"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "@/components/admin/adminSidebar";
import AdminHeader from "@/components/admin/adminHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role !== "Admin") {
      router.replace("/");
    }
  }, [currentUser, isLoading, router]);

  if (
    isLoading ||
    !currentUser ||
    currentUser.role !== "Admin"
  ) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />
        <p>Verifying administrator access...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="admin-main">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}