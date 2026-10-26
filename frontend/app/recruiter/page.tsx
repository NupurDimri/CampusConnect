
"use client";

import { useState } from "react";
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
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: "Active" | "Draft" | "Closed";
  posted: string;
};

const initialJobs: Job[] = [
  {
    id: 1,
    title: "Software Development Engineer",
    department: "Engineering",
    location: "Bengaluru",
    type: "Full-time",
    applicants: 48,
    status: "Active",
    posted: "Oct 18, 2026",
  },
  {
    id: 2,
    title: "Frontend Developer Intern",
    department: "Technology",
    location: "Remote",
    type: "Internship",
    applicants: 32,
    status: "Active",
    posted: "Oct 16, 2026",
  },
  {
    id: 3,
    title: "Junior Data Analyst",
    department: "Analytics",
    location: "Noida",
    type: "Full-time",
    applicants: 21,
    status: "Active",
    posted: "Oct 14, 2026",
  },
  {
    id: 4,
    title: "UI/UX Design Intern",
    department: "Design",
    location: "Remote",
    type: "Internship",
    applicants: 0,
    status: "Draft",
    posted: "Oct 12, 2026",
  },
];

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [notice, setNotice] = useState("");

  const visibleJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || job.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const activeJobs = jobs.filter((job) => job.status === "Active").length;
  const totalApplicants = jobs.reduce(
    (total, job) => total + job.applicants,
    0
  );

  function toggleJobStatus(id: number) {
    setJobs((previous) =>
      previous.map((job) => {
        if (job.id !== id) return job;

        const nextStatus =
          job.status === "Active" ? "Closed" : "Active";

        return { ...job, status: nextStatus };
      })
    );
    setNotice("Job status updated for this demo session.");
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

            <Link href="/recruiter/jobs/new" className="recruiter-primary-button">
              <Plus size={18} />
              Post a Job
            </Link>
          </header>

          {notice && (
            <div className="recruiter-notice" role="status">
              <CheckCircle2 size={18} />
              {notice}
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
              <Link href="/recruiter/jobs/new" className="recruiter-welcome-link">
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
              <small>Sample applicant count</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon purple">
                <Clock3 size={21} />
              </div>
              <span>Draft Jobs</span>
              <strong>
                {jobs.filter((job) => job.status === "Draft").length}
              </strong>
              <small>Not yet published</small>
            </div>
          </section>

          <section className="recruiter-jobs-panel" id="recruiter-jobs">
            <div className="recruiter-panel-heading">
              <div>
                <h2>Manage Job Listings</h2>
                <p>Review and manage the jobs associated with your account.</p>
              </div>
              <Link href="/recruiter/jobs/new" className="recruiter-add-link">
                <Plus size={16} />
                Add Job
              </Link>
            </div>

            <div className="recruiter-toolbar">
              <div className="recruiter-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search job title or department..."
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
                <option>All</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Closed</option>
              </select>
            </div>

            <div className="recruiter-job-list">
              {visibleJobs.length > 0 ? (
                visibleJobs.map((job) => (
                  <article className="recruiter-job-row" key={job.id}>
                    <div className="recruiter-job-icon">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div className="recruiter-job-info">
                      <h3>{job.title}</h3>
                      <p>{job.department}</p>

                      <div className="recruiter-job-meta">
                        <span><MapPin size={14} /> {job.location}</span>
                        <span>{job.type}</span>
                        <span>
                          <CalendarDays size={14} /> {job.posted}
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
                            `Demo: applicant management for "${job.title}" will be added next.`
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
                        title={job.status === "Active" ? "Close job" : "Reopen job"}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="recruiter-empty-state">
                  <BriefcaseBusiness size={28} />
                  <h3>No matching jobs</h3>
                  <p>Try a different search term or status filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            <div className="recruiter-list-footer">
              Showing demo job listings. Changes are temporary and will reset
              when the page is refreshed.
            </div>
          </section>

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
