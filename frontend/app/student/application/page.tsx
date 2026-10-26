
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  XCircle,
} from "lucide-react";

type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Rejected"
  | "Selected";

type Application = {
  id: number;
  jobId: number;
  role: string;
  company: string;
  location: string;
  type: string;
  date: string;
  status: ApplicationStatus;
};

const sampleApplications: Application[] = [
  {
    id: 1,
    jobId: 1,
    role: "Software Development Engineer",
    company: "TechNova",
    location: "Bengaluru",
    type: "Full-time",
    date: "Oct 18, 2026",
    status: "Under Review",
  },
  {
    id: 2,
    jobId: 2,
    role: "Frontend Developer Intern",
    company: "PixelCraft",
    location: "Remote",
    type: "Internship",
    date: "Oct 16, 2026",
    status: "Shortlisted",
  },
  {
    id: 3,
    jobId: 3,
    role: "Data Analyst",
    company: "InsightWorks",
    location: "Noida",
    type: "Full-time",
    date: "Oct 14, 2026",
    status: "Applied",
  },
  {
    id: 4,
    jobId: 4,
    role: "Python Developer Intern",
    company: "CodeBridge",
    location: "Dehradun",
    type: "Internship",
    date: "Oct 10, 2026",
    status: "Rejected",
  },
  {
    id: 5,
    jobId: 5,
    role: "UI/UX Design Intern",
    company: "DesignNest",
    location: "Remote",
    type: "Internship",
    date: "Oct 07, 2026",
    status: "Selected",
  },
];

const filters = [
  "All",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Selected",
];

const statusClass: Record<ApplicationStatus, string> = {
  Applied: "application-status-applied",
  "Under Review": "application-status-review",
  Shortlisted: "application-status-shortlisted",
  Rejected: "application-status-rejected",
  Selected: "application-status-selected",
};

function StatusIcon({ status }: { status: ApplicationStatus }) {
  if (status === "Shortlisted" || status === "Selected") {
    return <CheckCircle2 size={15} />;
  }

  if (status === "Rejected") {
    return <XCircle size={15} />;
  }

  if (status === "Under Review") {
    return <Clock3 size={15} />;
  }

  return <FileText size={15} />;
}

export default function MyApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sampleApplications.filter((application) => {
      const matchesFilter =
        activeFilter === "All" || application.status === activeFilter;

      const matchesSearch =
        !query ||
        application.role.toLowerCase().includes(query) ||
        application.company.toLowerCase().includes(query) ||
        application.location.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const countFor = (status: string) =>
    status === "All"
      ? sampleApplications.length
      : sampleApplications.filter((app) => app.status === status).length;

  const shortlistedCount = sampleApplications.filter(
    (app) => app.status === "Shortlisted"
  ).length;

  const pendingCount = sampleApplications.filter(
    (app) => app.status === "Applied" || app.status === "Under Review"
  ).length;

  const selectedCount = sampleApplications.filter(
    (app) => app.status === "Selected"
  ).length;

  return (
    <div className="applications-page">
      <div className="applications-container">
        <Link href="/student" className="applications-back-link">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="applications-heading">
          <div>
            <span className="applications-eyebrow">
              STUDENT WORKSPACE
            </span>
            <h1>My Applications</h1>
            <p>
              Track your placement journey and keep up with your application
              progress.
            </p>
          </div>

          <Link href="/jobs" className="applications-find-button">
            <Search size={17} />
            Find More Jobs
          </Link>
        </div>

        <div className="applications-stats">
          <div className="applications-stat-card">
            <div className="applications-stat-icon green">
              <FileText size={21} />
            </div>
            <span>Total Applications</span>
            <strong>{sampleApplications.length}</strong>
            <small>Submitted applications</small>
          </div>

          <div className="applications-stat-card">
            <div className="applications-stat-icon orange">
              <Clock3 size={21} />
            </div>
            <span>In Progress</span>
            <strong>{pendingCount}</strong>
            <small>Awaiting a decision</small>
          </div>

          <div className="applications-stat-card">
            <div className="applications-stat-icon blue">
              <CheckCircle2 size={21} />
            </div>
            <span>Shortlisted</span>
            <strong>{shortlistedCount}</strong>
            <small>Potential next steps</small>
          </div>

          <div className="applications-stat-card">
            <div className="applications-stat-icon purple">
              <BriefcaseBusiness size={21} />
            </div>
            <span>Selected</span>
            <strong>{selectedCount}</strong>
            <small>Successful applications</small>
          </div>
        </div>

        <section className="applications-list-panel">
          <div className="applications-list-heading">
            <div>
              <h2>Application History</h2>
              <p>View and filter your submitted applications.</p>
            </div>
            <span className="applications-count">
              {filteredApplications.length}{" "}
              {filteredApplications.length === 1 ? "application" : "applications"}
            </span>
          </div>

          <div className="applications-toolbar">
            <div className="applications-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search job title, company or location..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search applications"
              />
            </div>

            <button
              type="button"
              className="applications-clear-button"
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("All");
              }}
            >
              Clear filters
            </button>
          </div>

          <div className="applications-filter-list">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`applications-filter ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
                <span>{countFor(filter)}</span>
              </button>
            ))}
          </div>

          <div className="applications-records">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <article
                  className="application-record"
                  key={application.id}
                >
                  <div className="application-company-icon">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <div className="application-record-main">
                    <div className="application-record-title">
                      <h3>{application.role}</h3>
                      <span
                        className={`application-status ${
                          statusClass[application.status]
                        }`}
                      >
                        <StatusIcon status={application.status} />
                        {application.status}
                      </span>
                    </div>

                    <p className="application-company-name">
                      {application.company}
                    </p>

                    <div className="application-record-meta">
                      <span>{application.location}</span>
                      <span>{application.type}</span>
                      <span>
                        <CalendarDays size={14} />
                        Applied {application.date}
                      </span>
                    </div>

                    {application.status === "Shortlisted" && (
                      <p className="application-update shortlisted-update">
                        Your application has been shortlisted. Check for
                        recruiter updates.
                      </p>
                    )}

                    {application.status === "Selected" && (
                      <p className="application-update selected-update">
                        Congratulations! This sample application is marked
                        as selected.
                      </p>
                    )}

                    {application.status === "Rejected" && (
                      <p className="application-update rejected-update">
                        This application was not successful. Keep exploring
                        other opportunities.
                      </p>
                    )}

                    <div className="application-record-actions">
                      <Link href={`/jobs/${application.jobId}`}>
                        View Job Details <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="applications-empty-state">
                <div>
                  <Search size={25} />
                </div>
                <h3>No applications found</h3>
                <p>
                  Try a different search term or select another status filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("All");
                  }}
                >
                  Show all applications
                </button>
              </div>
            )}
          </div>

          <div className="applications-list-footer">
            Showing sample application data for frontend demonstration.
          </div>
        </section>

        <div className="applications-bottom-banner">
          <div>
            <h3>Your next opportunity could be one click away.</h3>
            <p>Explore available roles and keep building your career.</p>
          </div>
          <Link href="/jobs">
            Browse Jobs <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
