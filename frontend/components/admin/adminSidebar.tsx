"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BriefcaseBusiness,
  FileText,
  Settings,
  LogOut,
  GraduationCap,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: GraduationCap },
  { name: "Recruiters", href: "/admin/recruiters", icon: Building2 },
  { name: "Jobs", href: "/admin/jobs", icon: BriefcaseBusiness },
  { name: "Applications", href: "/admin/applications", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export default function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Admin logout failed:", error);
      setLoggingOut(false);
    }
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="admin-sidebar-overlay"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`admin-sidebar ${mobileOpen ? "admin-sidebar-open" : ""}`}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <GraduationCap size={25} />
          </div>

          <div className="admin-brand-text">
            <h2>Campus Connect</h2>
            <span>ADMINISTRATION</span>
          </div>

          <button
            type="button"
            className="admin-mobile-close"
            aria-label="Close sidebar"
            onClick={onMobileClose}
          >
            <X size={21} />
          </button>
        </div>

        <div className="admin-sidebar-section-label">MAIN MENU</div>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`admin-nav-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-help">
            <div className="admin-help-icon">
              <Users size={19} />
            </div>
            <div>
              <strong>Placement Management</strong>
              <p>Manage your campus ecosystem.</p>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}