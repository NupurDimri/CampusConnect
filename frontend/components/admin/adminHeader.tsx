"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";

type AdminHeaderProps = {
  onMenuClick?: () => void;
};

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");

  const adminName = currentUser?.fullName || "Administrator";
  const adminInitial = adminName.charAt(0).toUpperCase();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    window.location.href = `/admin?search=${encodeURIComponent(query)}`;
  }

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-menu-toggle"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu size={23} />
        </button>

        <div className="admin-header-title">
          <span>Workspace</span>
          <h1>Admin Panel</h1>
        </div>
      </div>

      <div className="admin-header-actions">
        <form className="admin-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="search"
            placeholder="Search Campus Connect..."
            aria-label="Search Campus Connect"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>

        <button
          type="button"
          className="admin-notification-button"
          aria-label="Notifications"
          title="Notifications (coming soon)"
        >
          <Bell size={20} />
          <span className="admin-notification-dot" />
        </button>

        <div className="admin-header-profile">
          <div className="admin-header-avatar">{adminInitial}</div>

          <div className="admin-header-profile-info">
            <strong>{adminName}</strong>
            <span>
              <ShieldCheck size={13} />
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}