"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
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
  AlertCircle,
} from "lucide-react";

type Application = {
  id: string;
  job_id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  work_mode: string;
  application_status: string;
  applied_at: string;
  salary?: string;
  resume_name?: string | null;
  resume_url?: string | null;
};

const filters = [
  "All",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Selected",
  "Interview Scheduled",
];

const statusClass: Record<string, string> = {
  Applied: "application-status-applied",
  "Under Review": "application-status-review",
  Shortlisted: "application-status-shortlisted",
  Rejected: "application-status-rejected",
  Selected: "application-status-selected",
  "Interview Scheduled": "application-status-shortlisted",
};

function normalizeStatus(status: string): string {
  return status
    .trim()
    .split(/[\s_-]+/)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

function StatusIcon({ status }: { status: string }) {
  if (status === "Shortlisted" || status === "Selected") {
    return <CheckCircle2 size={15} />;
  }

  if (status === "Rejected") {
    return <XCircle size={15} />;
  }

  if (status === "Under Review" || status === "Interview Scheduled") {
    return <Clock3 size={15} />;
  }

  return <FileText size={15} />;
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyApplicationsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setApplications([]);
      setError("Please log in to view your applications.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/applications", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load your applications."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected response.");
        }

        if (!cancelled) {
          setApplications(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading applications."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchApplications();

    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading]);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const status = normalizeStatus(
        application.application_status || ""
      );

      const matchesFilter =
        activeFilter === "All" || status === activeFilter;

      const matchesSearch =
        !query ||
        (application.title || "").toLowerCase().includes(query) ||
        (application.company || "").toLowerCase().includes(query) ||
        (application.location || "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [applications, activeFilter, searchTerm]);

  const countFor = (status: string) =>
    status === "All"
      ? applications.length
      : applications.filter(
          (application) =>
            normalizeStatus(application.application_status || "") === status
        ).length;

  const pendingCount = applications.filter((application) => {
    const status = normalizeStatus(
      application.application_status || ""
    );

    return status === "Applied" || status === "Under Review";
  }).length;

  const shortlistedCount = applications.filter(
    (application) =>
      normalizeStatus(application.application_status || "") === "Shortlisted"
  ).length;

  const selectedCount = applications.filter(
    (application) =>
      normalizeStatus(application.application_status || "") === "Selected"
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
            <strong>
              {loading || authLoading ? "—" : applications.length}
            </strong>
            <small>Submitted applications</small>
          </div>

          <div className="applications-stat-card">
            <div className="applications-stat-icon orange">
              <Clock3 size={21} />
            </div>
            <span>In Progress</span>
            <strong>
              {loading || authLoading ? "—" : pendingCount}
            </strong>
            <small>Awaiting a decision</small>
          </div>

          <div className="applications-stat-card">
            <div className="applications-stat-icon blue">
              <CheckCircle2 size={21} />
            </div>
            <span>Shortlisted</span>
            <strong>
              {loading || authLoading ? "—" : shortlistedCount}
            </strong>
            <small>Potential next steps</small>
          </div>

          <div className="applications-stat-card">
            <div className="applications-stat-icon purple">
              <BriefcaseBusiness size={21} />
            </div>
            <span>Selected</span>
            <strong>
              {loading || authLoading ? "—" : selectedCount}
            </strong>
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
              {loading || authLoading
                ? "Loading..."
                : `${filteredApplications.length} ${
                    filteredApplications.length === 1
                      ? "application"
                      : "applications"
                  }`}
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
            {authLoading || loading ? (
              <div className="applications-empty-state">
                <div>
                  <Clock3 size={25} />
                </div>
                <h3>Loading applications...</h3>
                <p>
                  Please wait while we retrieve your application history.
                </p>
              </div>
            ) : error ? (
              <div className="applications-empty-state">
                <div>
                  <AlertCircle size={25} />
                </div>
                <h3>Unable to load applications</h3>
                <p>{error}</p>

                {!currentUser ? (
                  <Link href="/login">Log in</Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((application) => {
                const status = normalizeStatus(
                  application.application_status || "Applied"
                );

                return (
                  <article
                    className="application-record"
                    key={application.id}
                  >
                    <div className="application-company-icon">
                      <BriefcaseBusiness size={23} />
                    </div>

                    <div className="application-record-main">
                      <div className="application-record-title">
                        <h3>{application.title}</h3>

                        <span
                          className={`application-status ${
                            statusClass[status] || ""
                          }`}
                        >
                          <StatusIcon status={status} />
                          {status}
                        </span>
                      </div>

                      <p className="application-company-name">
                        {application.company}
                      </p>

                      <div className="application-record-meta">
                        <span>
                          {application.location ||
                            "Location not specified"}
                        </span>

                        <span>
                          {application.job_type ||
                            "Job type not specified"}
                        </span>

                        <span>
                          <CalendarDays size={14} />
                          Applied {formatDate(application.applied_at)}
                        </span>
                      </div>

                      {status === "Shortlisted" && (
                        <p className="application-update shortlisted-update">
                          Your application has been shortlisted. Check for
                          recruiter updates.
                        </p>
                      )}

                      {status === "Interview Scheduled" && (
                        <p className="application-update interview-scheduled-update">
                          An interview has been scheduled. Check for further
                          instructions from the recruiter.
                        </p>
                      )}

                      {status === "Selected" && (
                        <p className="application-update selected-update">
                          Congratulations! Your application has been marked
                          as selected.
                        </p>
                      )}

                      {status === "Rejected" && (
                        <p className="application-update rejected-update">
                          This application was not successful. Keep exploring
                          other opportunities.
                        </p>
                      )}

                      <div className="application-record-actions">
                        <Link
                          href={`/jobs/${application.job_id}`}
                          className="inline-flex items-center gap-1"
                        >
                          View Job Details
                          <ArrowRight size={15} />
                        </Link>

                        {application.resume_url && (
                          <a
                            href={application.resume_url}
                            className="inline-flex items-center gap-1"
                            aria-label={`Download submitted resume ${
                              application.resume_name || ""
                            }`}
                          >
                            <FileText size={15} />
                            Download Submitted Resume
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="applications-empty-state">
                <div>
                  <Search size={25} />
                </div>

                <h3>
                  {applications.length === 0
                    ? "No applications yet"
                    : "No applications found"}
                </h3>

                <p>
                  {applications.length === 0
                    ? "When you apply for a job, it will appear here."
                    : "Try a different search term or select another status filter."}
                </p>

                {applications.length === 0 ? (
                  <Link href="/jobs">Explore Jobs</Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("All");
                    }}
                  >
                    Show all applications
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="applications-list-footer">
            {loading || authLoading
              ? "Retrieving your applications..."
              : error
                ? "Your application history could not be retrieved."
                : `Showing ${filteredApplications.length} of ${applications.length} applications from your database.`}
          </div>
        </section>

        <div className="applications-bottom-banner">
          <div>
            <h3>Your next opportunity could be one click away.</h3>
            <p>
              Explore available roles and keep building your career.
            </p>
          </div>

          <Link href="/jobs">
            Browse Jobs
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}