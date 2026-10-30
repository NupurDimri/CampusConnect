"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileText,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Total Students",
    value: "1,248",
    change: "Student accounts",
    icon: Users,
    color: "green",
    href: "/admin/students",
  },
  {
    label: "Recruiters",
    value: "86",
    change: "Registered recruiters",
    icon: Building2,
    color: "orange",
    href: "/admin/recruiters",
  },
  {
    label: "Active Jobs",
    value: "124",
    change: "Published opportunities",
    icon: BriefcaseBusiness,
    color: "blue",
    href: "/admin/jobs",
  },
  {
    label: "Applications",
    value: "2,486",
    change: "Submitted applications",
    icon: FileText,
    color: "purple",
    href: "/admin/applications",
  },
];

const recentActivity = [
  {
    title: "New student registration",
    description: "A student account was registered.",
    time: "Recently",
    icon: Users,
    color: "green",
  },
  {
    title: "Recruiter verification",
    description: "A recruiter account requires review.",
    time: "Pending review",
    icon: ShieldCheck,
    color: "orange",
  },
  {
    title: "New job posting",
    description: "A placement opportunity was submitted.",
    time: "Awaiting review",
    icon: BriefcaseBusiness,
    color: "blue",
  },
  {
    title: "Application activity",
    description: "Students are submitting applications.",
    time: "Recent activity",
    icon: FileText,
    color: "purple",
  },
];

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
            <p>A quick overview of your placement platform.</p>
          </div>

          <span className="admin-period-label">Dashboard Preview</span>
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

                <ArrowRight size={19} className="admin-action-arrow" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Example activities for the administration dashboard.</p>
          </div>

          <span className="admin-demo-badge">Sample data</span>
        </div>

        <div className="admin-activity-card">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div className="admin-activity-row" key={activity.title}>
                <div className={`admin-activity-icon ${activity.color}`}>
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

                {index === 0 && (
                  <CheckCircle2
                    size={17}
                    className="admin-activity-check"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="admin-dashboard-note">
        <ShieldCheck size={18} />
        <p>
          <strong>Development preview:</strong> The statistics and activity
          shown here are sample data. We will connect them to PostgreSQL
          after the interface is complete.
        </p>
      </div>
    </div>
  );
}