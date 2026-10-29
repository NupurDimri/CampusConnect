"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Users,
  Eye,
  Clock3,
  Plus,
  ArrowRight,
  MapPin,
  CalendarDays,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  UserRoundCheck,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: "Active" | "Draft" | "Closed";
  posted: string;
};

type Applicant = {
  id: string;
  job_id: string;
  student_email: string;
  application_status: string;
  applied_at: string;
  title: string;
  company: string;
};

const actionBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  minHeight: "40px",
  padding: "9px 14px",
  borderRadius: "10px",
  border: "1px solid",
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: 1.2,
  textDecoration: "none",
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "background-color 160ms ease, border-color 160ms ease",
};

const editButtonStyle: React.CSSProperties = {
  ...actionBase,
  color: "#173d2a",
  backgroundColor: "#ffffff",
  borderColor: "#d1dfd2",
};

const statusButtonStyle: React.CSSProperties = {
  ...actionBase,
  color: "#173d2a",
  backgroundColor: "#e7f4e9",
  borderColor: "#c6e4cc",
};

const deleteButtonStyle: React.CSSProperties = {
  ...actionBase,
  color: "#b42318",
  backgroundColor: "#fff5f4",
  borderColor: "#f0c9c6",
};

const applicantsButtonStyle: React.CSSProperties = {
  ...actionBase,
  color: "#ffffff",
  backgroundColor: "#173d2a",
  borderColor: "#173d2a",
};

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const jobsResponse = await fetch("/api/jobs", {
        cache: "no-store",
      });

      const jobsResult = await jobsResponse.json();

      if (!jobsResponse.ok) {
        throw new Error(jobsResult.error || "Unable to load job listings.");
      }

      if (!Array.isArray(jobsResult.jobs)) {
        throw new Error("Unexpected response from the jobs API.");
      }

      const databaseJobs: Job[] = jobsResult.jobs.map(
        (job: {
          id: string;
          title: string;
          company: string;
          department: string | null;
          location: string;
          job_type: string;
          status: string;
          created_at: string;
        }) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          department: job.department || "General",
          location: job.location,
          type: job.job_type,
          applicants: 0,
          status: job.status as Job["status"],
          posted: job.created_at
            ? new Date(job.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Date unavailable",
        })
      );

      const applicationResults = await Promise.all(
        databaseJobs.map(async (job) => {
          try {
            const response = await fetch(
              `/api/applications?jobId=${encodeURIComponent(job.id)}`,
              { cache: "no-store" }
            );

            const data = await response.json();

            if (!response.ok) {
              console.error(
                `Could not load applications for job ${job.id}:`,
                data
              );

              return {
                jobId: job.id,
                applications: [] as Applicant[],
                failed: true,
              };
            }

            const records: unknown[] = Array.isArray(data)
              ? data
              : data &&
                  typeof data === "object" &&
                  "applications" in data &&
                  Array.isArray(data.applications)
                ? data.applications
                : [];

            const normalized: Applicant[] = records
              .filter(
                (record): record is Record<string, unknown> =>
                  typeof record === "object" && record !== null
              )
              .map((record) => ({
                id: String(record.id ?? ""),
                job_id: String(record.job_id ?? job.id),
                student_email: String(record.student_email ?? ""),
                application_status: String(
                  record.application_status ?? record.status ?? "Applied"
                ),
                applied_at: String(record.applied_at ?? ""),
                title: String(record.title ?? job.title),
                company: String(record.company ?? job.company),
              }));

            return {
              jobId: job.id,
              applications: normalized,
              failed: false,
            };
          } catch (requestError) {
            console.error(
              `Error fetching applications for job ${job.id}:`,
              requestError
            );

            return {
              jobId: job.id,
              applications: [] as Applicant[],
              failed: true,
            };
          }
        })
      );

      const applicationMap = new Map(
        applicationResults.map((result) => [
          result.jobId,
          result.applications,
        ])
      );

      const jobsWithCounts = databaseJobs.map((job) => ({
        ...job,
        applicants: applicationMap.get(job.id)?.length ?? 0,
      }));

      setJobs(jobsWithCounts);
      setApplicants(
        applicationResults.flatMap((result) => result.applications)
      );

      if (applicationResults.some((result) => result.failed)) {
        setNotice(
          "Some application counts could not be loaded. Check the browser console."
        );
      }
    } catch (requestError) {
      console.error("Error loading recruiter dashboard:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the recruiter dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function toggleJobStatus(job: Job) {
    if (busyJobId) return;

    if (job.status === "Draft") {
      setNotice("Draft jobs cannot be closed or reopened from this button.");
      return;
    }

    const nextStatus: Job["status"] =
      job.status === "Active" ? "Closed" : "Active";

    try {
      setBusyJobId(job.id);
      setError("");
      setNotice("");

      const response = await fetch("/api/jobs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: job.id,
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Could not change the job to ${nextStatus}.`
        );
      }

      setJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob.id === job.id
            ? { ...currentJob, status: nextStatus }
            : currentJob
        )
      );

      setNotice(`"${job.title}" is now ${nextStatus.toLowerCase()}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update job status."
      );
    } finally {
      setBusyJobId(null);
    }
  }

  async function deleteJob(job: Job) {
    if (busyJobId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}" at ${job.company}?\n\nThis action cannot be undone. Associated applications may also be deleted.`
    );

    if (!confirmed) return;

    try {
      setBusyJobId(job.id);
      setError("");
      setNotice("");

      const response = await fetch(
        `/api/jobs?id=${encodeURIComponent(job.id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not delete this job.");
      }

      setJobs((currentJobs) =>
        currentJobs.filter((currentJob) => currentJob.id !== job.id)
      );

      setApplicants((currentApplicants) =>
        currentApplicants.filter((applicant) => applicant.job_id !== job.id)
      );

      setNotice(`"${job.title}" was deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the job."
      );
    } finally {
      setBusyJobId(null);
    }
  }

  const visibleJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(search) ||
      job.department.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search);

    const matchesFilter =
      activeFilter === "All" || job.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const activeJobs = jobs.filter((job) => job.status === "Active").length;

  const draftJobs = jobs.filter((job) => job.status === "Draft").length;

  const totalApplicants = applicants.length;

  const shortlistedApplicants = applicants.filter(
    (applicant) => applicant.application_status === "Shortlisted"
  ).length;

  const pendingApplicants = applicants.filter(
    (applicant) =>
      applicant.application_status === "Applied" ||
      applicant.application_status === "Under Review"
  ).length;

  return (
    <div className="recruiter-page">
      <div className="recruiter-container">
        <aside className="recruiter-sidebar">
          <Link href="/" className="recruiter-brand">
            <span className="recruiter-brand-icon">
              <BriefcaseBusiness size={21} />
            </span>

            <span>
              <strong>Campus Connect</strong>
              <small>Recruiter workspace</small>
            </span>
          </Link>

          <div className="recruiter-company">
            <div className="recruiter-company-icon">
              <Building2 size={23} />
            </div>

            <div>
              <strong>TechNova</strong>
              <span>Recruiter account</span>
            </div>
          </div>

          <p className="recruiter-nav-label">WORKSPACE</p>

          <nav className="recruiter-nav">
            <Link href="/recruiter" className="recruiter-nav-link active">
              <BriefcaseBusiness size={18} />
              Dashboard
            </Link>

            <a href="#recruiter-jobs" className="recruiter-nav-link">
              <Building2 size={18} />
              Manage Jobs
            </a>

            <a href="#recruiter-applicants" className="recruiter-nav-link">
              <Users size={18} />
              Applicants
            </a>
          </nav>

          <div className="recruiter-sidebar-help">
            <strong>Find your next great hire.</strong>
            <p>Create opportunities and discover talented students.</p>

            <a href="#recruiter-jobs">
              Manage openings <ArrowRight size={15} />
            </a>
          </div>
        </aside>

        <main className="recruiter-main">
          <header className="recruiter-topbar">
            <div>
              <span className="recruiter-eyebrow">RECRUITER WORKSPACE</span>
              <h1>Recruiter Dashboard</h1>
              <p>Manage your openings and monitor applicant activity.</p>
            </div>

            <Link
              href="/recruiter/jobs/new"
              className="recruiter-primary-button"
            >
              <Plus size={18} />
              Post a Job
            </Link>
          </header>

          {notice && (
            <div className="recruiter-notice" role="status">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
                style={{ marginLeft: "auto" }}
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="recruiter-notice" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadDashboard()}
                style={{ marginLeft: 12 }}
              >
                Retry
              </button>
            </div>
          )}

          <section className="recruiter-welcome">
            <div>
              <span>YOUR HIRING WORKSPACE</span>
              <h2>Welcome back, Recruiter!</h2>

              <p>
                Your next great candidate could be among today&apos;s
                applicants. Review your openings and keep hiring moving.
              </p>

              <Link
                href="/recruiter/jobs/new"
                className="recruiter-welcome-link"
              >
                Create a job opening <ArrowRight size={16} />
              </Link>
            </div>

            <div className="recruiter-welcome-art">
              <Users size={66} strokeWidth={1.3} />
            </div>
          </section>

          <section className="recruiter-stats">
            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon green">
                <BriefcaseBusiness size={21} />
              </div>
              <span>Total Job Listings</span>
              <strong>{isLoading ? "—" : jobs.length}</strong>
              <small>Across all statuses</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon orange">
                <Eye size={21} />
              </div>
              <span>Active Jobs</span>
              <strong>{isLoading ? "—" : activeJobs}</strong>
              <small>Currently accepting applicants</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon blue">
                <Users size={21} />
              </div>
              <span>Total Applicants</span>
              <strong>{isLoading ? "—" : totalApplicants}</strong>
              <small>Actual applications received</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon purple">
                <Clock3 size={21} />
              </div>
              <span>Draft Jobs</span>
              <strong>{isLoading ? "—" : draftJobs}</strong>
              <small>Not yet published</small>
            </div>
          </section>

          <section className="recruiter-jobs-panel" id="recruiter-jobs">
            <div className="recruiter-panel-heading">
              <div>
                <h2>Manage Job Listings</h2>
                <p>
                  Review and manage the jobs associated with your account.
                </p>
              </div>

              <Link
                href="/recruiter/jobs/new"
                className="recruiter-add-link"
              >
                <Plus size={16} />
                Add Job
              </Link>
            </div>

            <div className="recruiter-toolbar">
              <div className="recruiter-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search job title, company, or department..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search job listings"
                />
              </div>

              <select
                className="recruiter-filter-select"
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value)}
                aria-label="Filter jobs by status"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="recruiter-job-list">
              {isLoading ? (
                <div className="recruiter-empty-state">
                  <Clock3 size={28} />
                  <h3>Loading jobs...</h3>
                  <p>Fetching jobs and applications from the database.</p>
                </div>
              ) : visibleJobs.length > 0 ? (
                visibleJobs.map((job) => {
                  const isBusy = busyJobId === job.id;

                  return (
                    <article className="recruiter-job-row" key={job.id}>
                      <div className="recruiter-job-icon">
                        <BriefcaseBusiness size={22} />
                      </div>

                      <div className="recruiter-job-info">
                        <h3>{job.title}</h3>
                        <p>
                          {job.company}
                          {job.department ? ` · ${job.department}` : ""}
                        </p>

                        <div className="recruiter-job-meta">
                          <span>
                            <MapPin size={14} />
                            {job.location}
                          </span>
                          <span>{job.type}</span>
                          <span>
                            <CalendarDays size={14} />
                            {job.posted}
                          </span>
                        </div>
                      </div>

                      <div className="recruiter-job-applicants">
                        <strong>{job.applicants}</strong>
                        <span>Applicants</span>
                      </div>

                      <span
                        className={`recruiter-job-status status-${job.status.toLowerCase()}`}
                      >
                        {job.status}
                      </span>

                      <div
                        className="recruiter-job-actions"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "8px",
                          flexWrap: "wrap",
                          minWidth: 0,
                          width: "100%",
                          marginTop: "10px",
                        }}
                      >
                        <Link
                          href={`/recruiter/jobs/${encodeURIComponent(job.id)}/edit`}
                          style={editButtonStyle}
                          title="Edit job"
                          aria-label={`Edit ${job.title}`}
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          style={{
                            ...statusButtonStyle,
                            ...(isBusy ? { opacity: 0.6, cursor: "wait" } : {}),
                          }}
                          onClick={() => void toggleJobStatus(job)}
                          disabled={Boolean(busyJobId) || job.status === "Draft"}
                          title={
                            job.status === "Active"
                              ? "Close job"
                              : job.status === "Closed"
                                ? "Reopen job"
                                : "Draft jobs cannot be changed here"
                          }
                        >
                          {isBusy
                            ? "Saving..."
                            : job.status === "Active"
                              ? "Close"
                              : job.status === "Closed"
                                ? "Reopen"
                                : "Draft"}
                        </button>

                        <button
                          type="button"
                          style={{
                            ...deleteButtonStyle,
                            ...(isBusy ? { opacity: 0.6, cursor: "wait" } : {}),
                          }}
                          onClick={() => void deleteJob(job)}
                          disabled={Boolean(busyJobId)}
                          title="Delete job"
                        >
                          {isBusy ? "Please wait..." : "Delete"}
                        </button>

                        {/* Correct link to the job-specific applicants page */}
                        <Link
                          href={`/recruiter/jobs/${encodeURIComponent(job.id)}/applicants`}
                          style={applicantsButtonStyle}
                          aria-label={`View applicants for ${job.title}`}
                          title="View applicants"
                        >
                          <Users size={17} />
                          Applicants
                        </Link>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="recruiter-empty-state">
                  <BriefcaseBusiness size={28} />
                  <h3>
                    {jobs.length === 0
                      ? "No jobs posted yet"
                      : "No matching jobs"}
                  </h3>
                  <p>
                    {jobs.length === 0
                      ? "Create your first job opening to get started."
                      : "Try a different search term or status filter."}
                  </p>

                  {jobs.length === 0 ? (
                    <Link
                      href="/recruiter/jobs/new"
                      className="recruiter-primary-button"
                    >
                      <Plus size={18} />
                      Post a Job
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveFilter("All");
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="recruiter-list-footer">
              {isLoading
                ? "Loading job listings..."
                : `Showing ${visibleJobs.length} of ${jobs.length} job listings from the database.`}
            </div>
          </section>

          <section className="recruiter-jobs-panel" id="recruiter-applicants">
            <div className="recruiter-panel-heading">
              <div>
                <h2>Applicant Management</h2>
                <p>
                  Review student applications and track hiring progress.
                </p>
              </div>
            </div>

            {!isLoading && applicants.length > 0 && (
              <section className="recruiter-stats">
                <div className="recruiter-stat-card">
                  <div className="recruiter-stat-icon green">
                    <Users size={21} />
                  </div>
                  <span>Total Applications</span>
                  <strong>{applicants.length}</strong>
                  <small>Across the listed jobs</small>
                </div>

                <div className="recruiter-stat-card">
                  <div className="recruiter-stat-icon orange">
                    <Clock3 size={21} />
                  </div>
                  <span>Awaiting Review</span>
                  <strong>{pendingApplicants}</strong>
                  <small>Applied or under review</small>
                </div>

                <div className="recruiter-stat-card">
                  <div className="recruiter-stat-icon blue">
                    <UserRoundCheck size={21} />
                  </div>
                  <span>Shortlisted</span>
                  <strong>{shortlistedApplicants}</strong>
                  <small>Potential candidates</small>
                </div>
              </section>
            )}

            {isLoading ? (
              <div className="recruiter-empty-state">
                <Clock3 size={28} />
                <h3>Loading applicants...</h3>
                <p>Retrieving applications from PostgreSQL.</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="recruiter-empty-state">
                <BriefcaseBusiness size={28} />
                <h3>No job listings found</h3>
                <p>Create a job opening before managing applications.</p>
                <Link
                  href="/recruiter/jobs/new"
                  className="recruiter-primary-button"
                >
                  <Plus size={18} />
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="recruiter-job-list">
                {jobs.map((job) => {
                  const jobApplicants = applicants.filter(
                    (applicant) => applicant.job_id === job.id
                  );

                  return (
                    <article className="recruiter-job-row" key={job.id}>
                      <div className="recruiter-job-icon">
                        <Users size={22} />
                      </div>

                      <div className="recruiter-job-info">
                        <h3>{job.title}</h3>
                        <p>{job.company}</p>
                        <div className="recruiter-job-meta">
                          <span>{jobApplicants.length} application(s)</span>
                        </div>
                      </div>

                      <div className="recruiter-job-applicants">
                        <strong>{jobApplicants.length}</strong>
                        <span>Applicants</span>
                      </div>

                      {/* Correct link to the job-specific applicants page */}
                      <Link
                        href={`/recruiter/jobs/${encodeURIComponent(job.id)}/applicants`}
                        className="recruiter-add-link"
                      >
                        <Eye size={16} />
                        View Applicants
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="recruiter-list-footer">
              {isLoading
                ? "Loading applications..."
                : `${totalApplicants} application(s) across ${jobs.length} job listing(s).`}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}