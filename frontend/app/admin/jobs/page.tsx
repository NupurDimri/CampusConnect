"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  salary: string | number;
  deadline: string;
  description: string;
  responsibilities: string;
  eligibility: string;
  skills: string;
  status: string;
  isExpired: boolean;
};

const emptyJob: Job = {
  id: "",
  title: "",
  company: "",
  department: "",
  location: "",
  jobType: "Full-time",
  workMode: "On-site",
  salary: "",
  deadline: "",
  description: "",
  responsibilities: "",
  eligibility: "",
  skills: "",
  status: "Active",
  isExpired: false,
};

function getStatus(job: Job) {
  if (job.isExpired) return "Expired";
  return job.status.toLowerCase() === "active" ? "Active" : "Inactive";
}

function formatDate(date: string) {
  if (!date) return "Not specified";

  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "short", year: "numeric" }
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/jobs", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load jobs.");
      }

      setJobs(data.jobs || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load jobs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter((job) => getStatus(job) === "Active").length,
      expired: jobs.filter((job) => getStatus(job) === "Expired").length,
      inactive: jobs.filter((job) => getStatus(job) === "Inactive").length,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch = [
        job.title,
        job.company,
        job.location,
        job.department,
      ].some((value) => (value || "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || getStatus(job) === statusFilter;

      const matchesType =
        typeFilter === "All" || job.jobType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, search, statusFilter, typeFilter]);

  async function updateJob(
    id: string,
    updates: Partial<Job>,
    successMessage: string
  ) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/jobs/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update job.");
      }

      setNotice(successMessage);
      setEditingJob(null);
      setSelectedJob(null);
      await loadJobs();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update job."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(job: Job) {
    const nextStatus =
      job.status.toLowerCase() === "active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `Are you sure you want to mark "${job.title}" as ${nextStatus}?`
    );

    if (!confirmed) return;

    await updateJob(
      job.id,
      { status: nextStatus },
      `Job marked ${nextStatus.toLowerCase()} successfully.`
    );
  }

  async function deleteJob(job: Job) {
    const confirmed = window.confirm(
      `Delete "${job.title}" at ${job.company}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/jobs/${encodeURIComponent(job.id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete job.");
      }

      setNotice(data.message || "Job deleted successfully.");
      setSelectedJob(null);
      await loadJobs();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete job."
      );
    }
  }

  async function saveEditedJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingJob) return;

    if (
      !editingJob.title.trim() ||
      !editingJob.company.trim() ||
      !editingJob.location.trim()
    ) {
      setError("Title, company, and location are required.");
      return;
    }

    const {
      title,
      company,
      department,
      location,
      jobType,
      workMode,
      salary,
      deadline,
      description,
      responsibilities,
      eligibility,
      skills,
      status,
    } = editingJob;

    await updateJob(
      editingJob.id,
      {
        title: title.trim(),
        company: company.trim(),
        department,
        location: location.trim(),
        jobType,
        workMode,
        salary,
        deadline,
        description,
        responsibilities,
        eligibility,
        skills,
        status,
      },
      "Job details updated successfully."
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-breadcrumb">
        Admin <span>/</span> Jobs Management
      </div>

      <div className="admin-jobs-heading">
        <div>
          <h1>Jobs Management</h1>
          <p>Manage placement opportunities posted on Campus Connect.</p>
        </div>

        <button
          type="button"
          className="admin-secondary-btn admin-jobs-refresh"
          onClick={() => void loadJobs()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-jobs-alert admin-jobs-alert-error" role="alert">
          <XCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="admin-jobs-alert admin-jobs-alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="admin-stats-grid admin-jobs-stats">
        <div className="admin-stat-card">
          <div className="admin-jobs-stat-icon">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <p>Total Jobs</p>
            <h2>{stats.total}</h2>
            <span>All posted opportunities</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-jobs-stat-icon admin-jobs-icon-green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <p>Active Jobs</p>
            <h2>{stats.active}</h2>
            <span>Active and not expired</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-jobs-stat-icon admin-jobs-icon-orange">
            <Clock size={21} />
          </div>
          <div>
            <p>Expired Jobs</p>
            <h2>{stats.expired}</h2>
            <span>Past their deadline</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-jobs-stat-icon admin-jobs-icon-red">
            <XCircle size={21} />
          </div>
          <div>
            <p>Inactive Jobs</p>
            <h2>{stats.inactive}</h2>
            <span>Not currently active</span>
          </div>
        </div>
      </div>

      <section className="admin-table-card admin-jobs-table-card">
        <div className="admin-jobs-section-heading">
          <div>
            <h2>All Job Postings</h2>
            <p>Review and manage recruiter job postings.</p>
          </div>

          <span className="admin-jobs-result-count">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>

        <div className="admin-table-toolbar admin-jobs-toolbar">
          <label className="admin-search-box admin-jobs-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search title, company, location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="admin-jobs-filters">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>

            <select
              aria-label="Filter by job type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="All">All job types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper admin-jobs-table-wrapper">
          <table className="admin-table admin-jobs-table">
            <thead>
              <tr>
                <th>JOB DETAILS</th>
                <th>JOB TYPE</th>
                <th>LOCATION</th>
                <th>DEADLINE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="admin-empty-cell">
                    <span className="admin-jobs-loading">
                      <RefreshCw size={19} className="admin-jobs-spin" />
                      Loading jobs from PostgreSQL...
                    </span>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty-cell">
                    <div className="admin-jobs-empty">
                      <BriefcaseBusiness size={32} />
                      <h3>{jobs.length === 0 ? "No jobs found" : "No matching jobs"}</h3>
                      <p>
                        {jobs.length === 0
                          ? "Jobs posted by recruiters will appear here once saved to the database."
                          : "Try changing your search or filters."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const status = getStatus(job);

                  return (
                    <tr key={job.id}>
                      <td>
                        <div className="admin-jobs-job-cell">
                          <div className="admin-jobs-company-icon">
                            <Building2 size={19} />
                          </div>
                          <div>
                            <strong>{job.title}</strong>
                            <span>{job.company}</span>
                            {job.department && (
                              <small>{job.department}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-jobs-type">
                          {job.jobType || "Not specified"}
                        </span>
                        {job.workMode && (
                          <small className="admin-jobs-work-mode">
                            {job.workMode}
                          </small>
                        )}
                      </td>

                      <td>
                        <span className="admin-jobs-location">
                          <MapPin size={14} />
                          {job.location || "Not specified"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-jobs-deadline">
                          <CalendarDays size={14} />
                          {formatDate(job.deadline)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-jobs-status admin-jobs-status-${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-action-buttons admin-jobs-actions">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            title="View job"
                            aria-label={`View ${job.title}`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="admin-icon-btn"
                            title="Edit job"
                            aria-label={`Edit ${job.title}`}
                            onClick={() => {
                              setError("");
                              setEditingJob({ ...job });
                            }}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="admin-icon-btn"
                            title={
                              job.status.toLowerCase() === "active"
                                ? "Deactivate job"
                                : "Activate job"
                            }
                            aria-label={`Toggle status for ${job.title}`}
                            onClick={() => void toggleStatus(job)}
                          >
                            {job.status.toLowerCase() === "active" ? (
                              <XCircle size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            className="admin-icon-btn admin-jobs-delete-btn"
                            title="Delete job"
                            aria-label={`Delete ${job.title}`}
                            onClick={() => void deleteJob(job)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedJob && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedJob(null);
          }}
        >
          <section
            className="admin-modal admin-jobs-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-job-view-title"
          >
            <div className="admin-modal-header">
              <div>
                <h2 id="admin-job-view-title">Job Details</h2>
                <p>Complete information about this posting.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                aria-label="Close job details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body admin-jobs-detail-body">
              <span
                className={`admin-jobs-status admin-jobs-status-${getStatus(selectedJob).toLowerCase()}`}
              >
                {getStatus(selectedJob)}
              </span>

              <h3>{selectedJob.title}</h3>
              <p className="admin-jobs-detail-company">
                <Building2 size={17} />
                {selectedJob.company}
              </p>

              <div className="admin-jobs-detail-grid">
                <div><span>Department</span><strong>{selectedJob.department || "Not specified"}</strong></div>
                <div><span>Job type</span><strong>{selectedJob.jobType || "Not specified"}</strong></div>
                <div><span>Work mode</span><strong>{selectedJob.workMode || "Not specified"}</strong></div>
                <div><span>Location</span><strong>{selectedJob.location || "Not specified"}</strong></div>
                <div><span>Salary</span><strong>{selectedJob.salary || "Not specified"}</strong></div>
                <div><span>Application deadline</span><strong>{formatDate(selectedJob.deadline)}</strong></div>
              </div>

              <div className="admin-jobs-detail-section">
                <h4>Description</h4>
                <p>{selectedJob.description || "No description provided."}</p>
              </div>

              <div className="admin-jobs-detail-section">
                <h4>Responsibilities</h4>
                <p>{selectedJob.responsibilities || "Not specified."}</p>
              </div>

              <div className="admin-jobs-detail-section">
                <h4>Eligibility</h4>
                <p>{selectedJob.eligibility || "Not specified."}</p>
              </div>

              <div className="admin-jobs-detail-section">
                <h4>Required skills</h4>
                <p>{selectedJob.skills || "Not specified."}</p>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-primary-btn"
                onClick={() => {
                  setEditingJob({ ...selectedJob });
                  setSelectedJob(null);
                }}
              >
                <Pencil size={16} /> Edit Job
              </button>
            </div>
          </section>
        </div>
      )}

      {editingJob && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditingJob(null);
            }
          }}
        >
          <section
            className="admin-modal admin-jobs-modal admin-jobs-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-job-edit-title"
          >
            <div className="admin-modal-header">
              <div>
                <h2 id="admin-job-edit-title">Edit Job</h2>
                <p>Update the job posting information.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                disabled={saving}
                aria-label="Close edit form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveEditedJob}>
              <div className="admin-modal-body admin-jobs-edit-form">
                <div className="admin-jobs-form-grid">
                  <label>
                    Job Title *
                    <input
                      required
                      value={editingJob.title}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, title: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Company *
                    <input
                      required
                      value={editingJob.company}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, company: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Department
                    <input
                      value={editingJob.department}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, department: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Location *
                    <input
                      required
                      value={editingJob.location}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, location: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Job Type
                    <select
                      value={editingJob.jobType}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, jobType: e.target.value })
                      }
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                    </select>
                  </label>

                  <label>
                    Work Mode
                    <select
                      value={editingJob.workMode}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, workMode: e.target.value })
                      }
                    >
                      <option>On-site</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                    </select>
                  </label>

                  <label>
                    Salary
                    <input
                      value={editingJob.salary}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, salary: e.target.value })
                      }
                      placeholder="e.g. ₹4–6 LPA"
                    />
                  </label>

                  <label>
                    Application Deadline
                    <input
                      type="date"
                      value={editingJob.deadline}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, deadline: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={editingJob.status}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, status: e.target.value })
                      }
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </label>
                </div>

                <label className="admin-jobs-full-field">
                  Description
                  <textarea
                    rows={4}
                    value={editingJob.description}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, description: e.target.value })
                    }
                  />
                </label>

                <label className="admin-jobs-full-field">
                  Responsibilities
                  <textarea
                    rows={3}
                    value={editingJob.responsibilities}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        responsibilities: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="admin-jobs-full-field">
                  Eligibility
                  <textarea
                    rows={3}
                    value={editingJob.eligibility}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, eligibility: e.target.value })
                    }
                  />
                </label>

                <label className="admin-jobs-full-field">
                  Required Skills
                  <textarea
                    rows={2}
                    value={editingJob.skills}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, skills: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setEditingJob(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}