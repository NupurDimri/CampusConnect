"use client";

import { useEffect, useState } from "react";
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
  MoreHorizontal,
  Search,
  Building2,
  CheckCircle2,
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

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs from PostgreSQL through the API.
  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch("/api/jobs");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load jobs from the database."
          );
        }

        const databaseJobs: Job[] = result.jobs.map(
          (job: {
            id: string;
            title: string;
            company: string;
            department: string | null;
            location: string;
            job_type: string;
            applicants: number;
            status: string;
            created_at: string;
          }) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            department: job.department || "General",
            location: job.location,
            type: job.job_type,
            applicants: Number(job.applicants),
            status: job.status as Job["status"],
            posted: new Date(job.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          })
        );

        setJobs(databaseJobs);
      } catch (error) {
        console.error("Error loading jobs:", error);

        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to load jobs from the database."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, []);

  // Search and filter jobs.
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

  // Dashboard statistics.
  const activeJobs = jobs.filter((job) => job.status === "Active").length;

  const totalApplicants = jobs.reduce(
    (total, job) => total + job.applicants,
    0
  );

  const draftJobs = jobs.filter((job) => job.status === "Draft").length;

  // Temporary status toggle. Database persistence will be added next.
  function toggleJobStatus(id: string) {
    setJobs((previous) =>
      previous.map((job) => {
        if (job.id !== id) return job;

        const nextStatus: Job["status"] =
          job.status === "Active" ? "Closed" : "Active";

        return { ...job, status: nextStatus };
      })
    );

    setNotice("Job status updated for this session only.");

    window.setTimeout(() => {
      setNotice("");
    }, 3000);
  }

  return (
    <div className="recruiter-page">
      <div className="recruiter-container">
        {/* Sidebar */}
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

            <p>
              Create opportunities and discover talented students.
            </p>

            <a href="#recruiter-jobs">
              Manage openings <ArrowRight size={15} />
            </a>
          </div>
        </aside>

        {/* Main dashboard */}
        <main className="recruiter-main">
          {/* Header */}
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
              <Plus size={18} />
              Post a Job
            </Link>
          </header>

          {/* Notification */}
          {notice && (
            <div className="recruiter-notice" role="status">
              <CheckCircle2 size={18} />
              {notice}
            </div>
          )}

          {/* Welcome section */}
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

          {/* Statistics */}
          <section className="recruiter-stats">
            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon green">
                <BriefcaseBusiness size={21} />
              </div>

              <span>Total Job Listings</span>
              <strong>{jobs.length}</strong>
              <small>Across all statuses</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon orange">
                <Eye size={21} />
              </div>

              <span>Active Jobs</span>
              <strong>{activeJobs}</strong>
              <small>Currently accepting applicants</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon blue">
                <Users size={21} />
              </div>

              <span>Total Applicants</span>
              <strong>{totalApplicants}</strong>
              <small>Across all job listings</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon purple">
                <Clock3 size={21} />
              </div>

              <span>Draft Jobs</span>
              <strong>{draftJobs}</strong>
              <small>Not yet published</small>
            </div>
          </section>

          {/* Job listings */}
          <section
            className="recruiter-jobs-panel"
            id="recruiter-jobs"
          >
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

            {/* Search and filters */}
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
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Job list */}
            <div className="recruiter-job-list">
              {isLoading ? (
                <div className="recruiter-empty-state">
                  <Clock3 size={28} />
                  <h3>Loading jobs...</h3>
                  <p>Fetching your job listings from the database.</p>
                </div>
              ) : visibleJobs.length > 0 ? (
                visibleJobs.map((job) => (
                  <article
                    className="recruiter-job-row"
                    key={job.id}
                  >
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

                    <div className="recruiter-job-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setNotice(
                            `Applicant management for "${job.title}" will be added next.`
                          )
                        }
                        aria-label={`View applicants for ${job.title}`}
                        title="View applicants"
                      >
                        <Users size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleJobStatus(job.id)}
                        disabled={job.status === "Draft"}
                        aria-label={`${
                          job.status === "Active" ? "Close" : "Reopen"
                        } ${job.title}`}
                        title={
                          job.status === "Active" ? "Close job" : "Reopen job"
                        }
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </article>
                ))
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

          {/* Applicant management placeholder */}
          <section
            className="recruiter-applicants-panel"
            id="recruiter-applicants"
          >
            <div className="recruiter-panel-heading">
              <div>
                <h2>Applicant Management</h2>

                <p>
                  The next step is to review student applications and update
                  their hiring status.
                </p>
              </div>
            </div>

            <div className="recruiter-applicant-placeholder">
              <div>
                <Users size={26} />
              </div>

              <h3>Applicant review is coming next</h3>

              <p>
                We&apos;ll build the applicant list, student details, resume
                review, and shortlist/reject actions as the next feature.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}