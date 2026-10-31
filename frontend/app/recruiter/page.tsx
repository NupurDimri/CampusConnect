
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

type ApplicationResult = {
  jobId: string;
  applications: Applicant[];
  failed: boolean;
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
  const [applicationLoadFailed, setApplicationLoadFailed] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setNotice("");
    setApplicationLoadFailed(false);

    try {
      const jobsResponse = await fetch("/api/jobs?mine=true", {
        cache: "no-store",
      });

      const jobsData = await jobsResponse.json();

      if (!jobsResponse.ok) {
        throw new Error(jobsData.error || "Unable to load jobs.");
      }

      if (!Array.isArray(jobsData.jobs)) {
        throw new Error("Unexpected response from the jobs API.");
      }

      const databaseJobs: Job[] = jobsData.jobs.map(
        (job: Record<string, unknown>) => ({
          id: String(job.id ?? ""),
          title: String(job.title ?? ""),
          company: String(job.company ?? ""),
          department: String(job.department ?? "General"),
          location: String(job.location ?? ""),
          type: String(job.job_type ?? job.jobType ?? ""),
          applicants: 0,
          status: String(job.status ?? "Draft") as Job["status"],
          posted: job.created_at
            ? new Date(String(job.created_at)).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Date unavailable",
        })
      );

      const applicationResults: ApplicationResult[] = await Promise.all(
        databaseJobs.map(async (job) => {
          try {
            const response = await fetch(
              `/api/applications?jobId=${encodeURIComponent(job.id)}`,
              { cache: "no-store" }
            );

            const data = await response.json();

            if (!response.ok) {
              return {
                jobId: job.id,
                applications: [],
                failed: true,
              };
            }

            const records: Record<string, unknown>[] = Array.isArray(data)
              ? data
              : Array.isArray(data.applications)
                ? data.applications
                : [];

            const normalized: Applicant[] = records.map((record) => ({
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
          } catch {
            return {
              jobId: job.id,
              applications: [],
              failed: true,
            };
          }
        })
      );

      const failed = applicationResults.some((item) => item.failed);

      const applicationMap = new Map(
        applicationResults.map((item) => [
          item.jobId,
          item.applications,
        ])
      );

      setJobs(
        databaseJobs.map((job) => ({
          ...job,
          applicants: applicationMap.get(job.id)?.length ?? 0,
        }))
      );

      setApplicants(
        applicationResults.flatMap((item) => item.applications)
      );

      setApplicationLoadFailed(failed);

      if (failed) {
        setNotice(
          "Some applicant totals could not be loaded. Please retry."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
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
    if (busyJobId || job.status === "Draft") return;

    const nextStatus = job.status === "Active" ? "Closed" : "Active";

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update job.");
      }

      setJobs((current) =>
        current.map((item) =>
          item.id === job.id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setNotice(
        `"${job.title}" is now ${nextStatus.toLowerCase()}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update job."
      );
    } finally {
      setBusyJobId(null);
    }
  }

  async function deleteJob(job: Job) {
    if (busyJobId) return;

    if (!window.confirm(`Delete "${job.title}" at ${job.company}?`)) {
      return;
    }

    try {
      setBusyJobId(job.id);
      setError("");
      setNotice("");

      const response = await fetch(
        `/api/jobs?id=${encodeURIComponent(job.id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete job.");
      }

      setJobs((current) =>
        current.filter((item) => item.id !== job.id)
      );

      setApplicants((current) =>
        current.filter((item) => item.job_id !== job.id)
      );

      setNotice("Job deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete job."
      );
    } finally {
      setBusyJobId(null);
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.trim().toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      job.department.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term);

    return (
      matchesSearch &&
      (activeFilter === "All" || job.status === activeFilter)
    );
  });

  const activeJobs = jobs.filter(
    (job) => job.status === "Active"
  ).length;

  const draftJobs = jobs.filter(
    (job) => job.status === "Draft"
  ).length;

  const shortlisted = applicants.filter(
    (applicant) =>
      applicant.application_status.toLowerCase() === "shortlisted"
  ).length;

  const pending = applicants.filter((applicant) =>
    ["applied", "under review"].includes(
      applicant.application_status.toLowerCase()
    )
  ).length;

  function JobRow({ job }: { job: Job }) {
    const busy = busyJobId === job.id;

    return (
      <article className="recruiter-job-row">
        <div className="recruiter-job-icon">
          <BriefcaseBusiness size={22} />
        </div>

        <div className="recruiter-job-info">
          <h3>{job.title}</h3>
          <p>
            {job.company} · {job.department}
          </p>

          <div className="recruiter-job-meta">
            <span>
              <MapPin size={14} /> {job.location}
            </span>
            <span>{job.type}</span>
            <span>
              <CalendarDays size={14} /> {job.posted}
            </span>
          </div>
        </div>

        <div className="recruiter-job-applicants">
          <strong>
            {applicationLoadFailed ? "—" : job.applicants}
          </strong>
          <span>Applicants</span>
        </div>

        <span
          className={`recruiter-job-status status-${job.status.toLowerCase()}`}
        >
          {job.status}
        </span>

        <div className="recruiter-job-actions">
          <Link
            href={`/recruiter/jobs/${encodeURIComponent(job.id)}/edit`}
            className="recruiter-add-link"
          >
            Edit
          </Link>

          <button
            type="button"
            className="recruiter-add-link"
            disabled={busy || job.status === "Draft"}
            onClick={() => void toggleJobStatus(job)}
          >
            {busy
              ? "Saving..."
              : job.status === "Active"
                ? "Close"
                : "Reopen"}
          </button>

          <button
            type="button"
            className="recruiter-add-link"
            disabled={busy}
            onClick={() => void deleteJob(job)}
          >
            {busy ? "Please wait..." : "Delete"}
          </button>

          <Link
            href={`/recruiter/jobs/${encodeURIComponent(job.id)}/applicants`}
            className="recruiter-primary-button"
          >
            <Users size={16} /> Applicants
          </Link>
        </div>
      </article>
    );
  }

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
              <strong>Recruiter Account</strong>
              <span>Recruiter workspace</span>
            </div>
          </div>

          <p className="recruiter-nav-label">WORKSPACE</p>

          <nav className="recruiter-nav">
            <Link href="/recruiter" className="recruiter-nav-link active">
              <BriefcaseBusiness size={18} /> Dashboard
            </Link>

            <Link href="/recruiter/jobs" className="recruiter-nav-link">
              <Building2 size={18} /> Manage Jobs
            </Link>

            <Link
              href="/recruiter/applicants"
              className="recruiter-nav-link"
            >
              <Users size={18} /> Applicants
            </Link>
          </nav>

          <div className="recruiter-sidebar-help">
            <strong>Find your next great hire.</strong>
            <p>
              Create opportunities and discover talented students.
            </p>
            <Link href="/recruiter/jobs">
              Manage openings <ArrowRight size={15} />
            </Link>
          </div>
        </aside>

        <main className="recruiter-main">
          <header className="recruiter-topbar">
            <div>
              <span className="recruiter-eyebrow">
                RECRUITER WORKSPACE
              </span>
              <h1>Recruiter Dashboard</h1>
              <p>
                Manage your openings and monitor applicant activity.
              </p>
            </div>

            <Link
              href="/recruiter/jobs/new"
              className="recruiter-primary-button"
            >
              <Plus size={18} /> Post a Job
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
              <strong>
                {isLoading || applicationLoadFailed
                  ? "—"
                  : applicants.length}
              </strong>
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

          <section className="recruiter-jobs-panel">
            <div className="recruiter-panel-heading">
              <div>
                <h2>Recent Jobs</h2>
                <p>Your two most recent job listings.</p>
              </div>

              <Link
                href="/recruiter/jobs"
                className="recruiter-add-link"
              >
                View All Jobs <ArrowRight size={16} />
              </Link>
            </div>

            <div className="recruiter-toolbar">
              <div className="recruiter-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search job title, company, or department..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  aria-label="Search job listings"
                />
              </div>

              <select
                className="recruiter-filter-select"
                value={activeFilter}
                onChange={(event) =>
                  setActiveFilter(event.target.value)
                }
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
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs
                  .slice(0, 2)
                  .map((job) => <JobRow key={job.id} job={job} />)
              ) : (
                <div className="recruiter-empty-state">
                  <BriefcaseBusiness size={28} />
                  <h3>
                    {jobs.length
                      ? "No matching jobs"
                      : "No jobs posted yet"}
                  </h3>
                  <p>
                    {jobs.length
                      ? "Try another search or status."
                      : "Create your first job opening to get started."}
                  </p>

                  {!jobs.length && (
                    <Link
                      href="/recruiter/jobs/new"
                      className="recruiter-primary-button"
                    >
                      <Plus size={18} /> Post a Job
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="recruiter-list-footer">
              {isLoading
                ? "Loading job listings..."
                : `Showing ${Math.min(2, filteredJobs.length)} of ${filteredJobs.length} matching jobs.`}
            </div>
          </section>

          <section className="recruiter-jobs-panel">
            <div className="recruiter-panel-heading">
              <div>
                <h2>Applicant Management</h2>
                <p>
                  Review student applications and track hiring progress.
                </p>
              </div>

              <Link
                href="/recruiter/applicants"
                className="recruiter-add-link"
              >
                View All Applicants <ArrowRight size={16} />
              </Link>
            </div>

            {!isLoading && (
              <section className="recruiter-stats">
                <div className="recruiter-stat-card">
                  <div className="recruiter-stat-icon green">
                    <Users size={21} />
                  </div>
                  <span>Total Applications</span>
                  <strong>
                    {applicationLoadFailed ? "—" : applicants.length}
                  </strong>
                  <small>Across your job listings</small>
                </div>

                <div className="recruiter-stat-card">
                  <div className="recruiter-stat-icon orange">
                    <Clock3 size={21} />
                  </div>
                  <span>Awaiting Review</span>
                  <strong>
                    {applicationLoadFailed ? "—" : pending}
                  </strong>
                  <small>Applied or under review</small>
                </div>

                <div className="recruiter-stat-card">
                  <div className="recruiter-stat-icon blue">
                    <UserRoundCheck size={21} />
                  </div>
                  <span>Shortlisted</span>
                  <strong>
                    {applicationLoadFailed ? "—" : shortlisted}
                  </strong>
                  <small>Potential candidates</small>
                </div>
              </section>
            )}

            {isLoading ? (
              <div className="recruiter-empty-state">
                <Clock3 size={28} />
                <h3>Loading applicants...</h3>
              </div>
            ) : jobs.length === 0 ? (
              <div className="recruiter-empty-state">
                <BriefcaseBusiness size={28} />
                <h3>No job listings found</h3>
                <p>
                  Create a job opening before managing applications.
                </p>
              </div>
            ) : (
              <div className="recruiter-job-list">
                {jobs.slice(0, 2).map((job) => (
                  <article
                    className="recruiter-job-row"
                    key={job.id}
                  >
                    <div className="recruiter-job-icon">
                      <Users size={22} />
                    </div>

                    <div className="recruiter-job-info">
                      <h3>{job.title}</h3>
                      <p>{job.company}</p>
                      <div className="recruiter-job-meta">
                        <span>
                          {applicationLoadFailed
                            ? "Count unavailable"
                            : `${job.applicants} application(s)`}
                        </span>
                      </div>
                    </div>

                    <div className="recruiter-job-applicants">
                      <strong>
                        {applicationLoadFailed ? "—" : job.applicants}
                      </strong>
                      <span>Applicants</span>
                    </div>

                    <Link
                      href={`/recruiter/jobs/${encodeURIComponent(job.id)}/applicants`}
                      className="recruiter-add-link"
                    >
                      <Eye size={16} /> View Applicants
                    </Link>
                  </article>
                ))}
              </div>
            )}

            <div className="recruiter-list-footer">
              {isLoading
                ? "Loading applications..."
                : `${applicationLoadFailed ? "Some counts are unavailable." : `${applicants.length} application(s)`} across ${jobs.length} job listing(s).`}
            </div>

            {applicationLoadFailed && (
              <div style={{ textAlign: "center", padding: 12 }}>
                <button
                  type="button"
                  className="recruiter-add-link"
                  onClick={() => void loadDashboard()}
                >
                  Retry loading applications
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
