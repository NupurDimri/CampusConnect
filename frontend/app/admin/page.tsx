"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileText,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

type DashboardStats = {
  students: number;
  recruiters: number;
  jobs: number;
  applications: number;
};

type Activity = {
  title: string;
  description: string;
  time: string;
  type: string;
};

const quickActions = [
  {
    title: "Manage Students",
    description: "Review student accounts and profiles.",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Review Recruiters",
    description: "Manage recruiter registrations.",
    href: "/admin/recruiters",
    icon: Building2,
  },
  {
    title: "Manage Job Listings",
    description: "Review placement opportunities.",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    title: "View Applications",
    description: "Monitor placement applications.",
    href: "/admin/applications",
    icon: FileText,
  },
];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    students: 0,
    recruiters: 0,
    jobs: 0,
    applications: 0,
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard information."
          );
        }

        setDashboardData(data.stats);
        setRecentActivity(data.recentActivity);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);

        setDashboardError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    {
      label: "Total Students",
      value: loading
        ? "..."
        : dashboardData.students.toLocaleString("en-IN"),
      change: "Student accounts",
      icon: Users,
      color: "green",
      href: "/admin/students",
    },
    {
      label: "Recruiters",
      value: loading
        ? "..."
        : dashboardData.recruiters.toLocaleString("en-IN"),
      change: "Registered recruiters",
      icon: Building2,
      color: "orange",
      href: "/admin/recruiters",
    },
    {
      label: "Active Jobs",
      value: loading
        ? "..."
        : dashboardData.jobs.toLocaleString("en-IN"),
      change: "Active opportunities",
      icon: BriefcaseBusiness,
      color: "blue",
      href: "/admin/jobs",
    },
    {
      label: "Applications",
      value: loading
        ? "..."
        : dashboardData.applications.toLocaleString("en-IN"),
      change: "Submitted applications",
      icon: FileText,
      color: "purple",
      href: "/admin/applications",
    },
  ];

  return (
    <div className="admin-dashboard">
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">
            <ShieldCheck size={15} />
            ADMINISTRATION OVERVIEW
          </span>

          <h2>Welcome to Campus Connect</h2>

          <p>
            Manage students, recruiters, placement opportunities, and
            applications from one central workspace.
          </p>
        </div>

        <div className="admin-welcome-icon">
          <TrendingUp size={35} />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h2>Platform Overview</h2>
            <p>A live overview of your placement platform.</p>
          </div>

          <span className="admin-period-label">
            {loading ? "Loading..." : "Live Database"}
          </span>
        </div>

        <div className="admin-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                href={stat.href}
                key={stat.label}
                className="admin-stat-card"
              >
                <div className="admin-stat-top">
                  <div className={`admin-stat-icon ${stat.color}`}>
                    <Icon size={22} />
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="admin-stat-arrow"
                  />
                </div>

                <p className="admin-stat-label">{stat.label}</p>
                <h3>{stat.value}</h3>

                <div className="admin-stat-footer">
                  <span>{stat.change}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {dashboardError && (
          <p role="alert" style={{ color: "#b91c1c", marginTop: "12px" }}>
            Unable to load dashboard statistics: {dashboardError}
          </p>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Navigate directly to the main management sections.</p>
          </div>
        </div>

        <div className="admin-quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                href={action.href}
                className="admin-action-card"
                key={action.title}
              >
                <div className="admin-action-icon">
                  <Icon size={22} />
                </div>

                <div className="admin-action-text">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <ArrowRight
                  size={19}
                  className="admin-action-arrow"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest activity recorded on the placement platform.</p>
          </div>

          <span className="admin-period-label">Live Database</span>
        </div>

        <div className="admin-activity-card">
          {loading ? (
            <div className="admin-activity-row">
              <div className="admin-activity-details">
                <strong>Loading activity...</strong>
                <p>Fetching the latest database records.</p>
              </div>
            </div>
          ) : dashboardError ? (
            <div className="admin-activity-row">
              <div className="admin-activity-details">
                <strong>Unable to load recent activity</strong>
                <p>{dashboardError}</p>
              </div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="admin-activity-row">
              <div className="admin-activity-details">
                <strong>No recent activity</strong>
                <p>
                  New student registrations, recruiter registrations, and
                  applications will appear here.
                </p>
              </div>
            </div>
          ) : (
            recentActivity.map((activity, index) => {
              const Icon =
                activity.type === "student"
                  ? Users
                  : activity.type === "recruiter"
                    ? Building2
                    : FileText;

              const color =
                activity.type === "student"
                  ? "green"
                  : activity.type === "recruiter"
                    ? "orange"
                    : "purple";

              return (
                <div
                  className="admin-activity-row"
                  key={`${activity.type}-${index}`}
                >
                  <div className={`admin-activity-icon ${color}`}>
                    <Icon size={19} />
                  </div>

                  <div className="admin-activity-details">
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                  </div>

                  <div className="admin-activity-time">
                    <Clock3 size={14} />
                    <span>{activity.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="admin-dashboard-note">
        <ShieldCheck size={18} />
        <p>
          <strong>Database connected:</strong> Dashboard statistics and recent
          activity are fetched from PostgreSQL.
        </p>
      </div>
    </div>
  );
}