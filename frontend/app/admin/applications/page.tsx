"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  CalendarDays,
} from "lucide-react";

type Application = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  college: string;
  degree: string;
  branch: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  appliedAt: string | null;
};

const statuses = [
  "Pending",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

function formatDate(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/applications", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load applications.");
      }

      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((app) =>
        ["pending", "under review"].includes(app.status.toLowerCase())
      ).length,
      shortlisted: applications.filter((app) =>
        ["shortlisted", "interview"].includes(app.status.toLowerCase())
      ).length,
      selected: applications.filter(
        (app) => app.status.toLowerCase() === "selected"
      ).length,
      rejected: applications.filter(
        (app) => app.status.toLowerCase() === "rejected"
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((app) => {
      const matchesSearch = [
        app.studentName,
        app.studentEmail,
        app.jobTitle,
        app.company,
        app.college,
      ].some((value) => (value || "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  async function updateStatus(
    application: Application,
    newStatus: string
  ) {
    if (application.status === newStatus) return;

    setSavingId(application.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/applications/${encodeURIComponent(application.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? { ...item, status: data.application.status }
            : item
        )
      );

      setSelectedApplication((current) =>
        current?.id === application.id
          ? { ...current, status: data.application.status }
          : current
      );

      setNotice(`Application status changed to ${newStatus}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update application."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-breadcrumb">
        Admin <span>/</span> Applications Management
      </div>

      <div className="admin-applications-heading">
        <div>
          <h1>Applications Management</h1>
          <p>
            Review student applications and manage their recruitment progress.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-btn admin-applications-refresh"
          onClick={() => void loadApplications()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-applications-alert admin-applications-error" role="alert">
          <XCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="admin-applications-alert admin-applications-success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="admin-stats-grid admin-applications-stats">
        <div className="admin-stat-card">
          <div className="admin-applications-stat-icon">
            <FileText size={21} />
          </div>
          <div>
            <p>Total Applications</p>
            <h2>{stats.total}</h2>
            <span>All submitted applications</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-applications-stat-icon applications-icon-orange">
            <Clock size={21} />
          </div>
          <div>
            <p>Pending Review</p>
            <h2>{stats.pending}</h2>
            <span>Awaiting a final decision</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-applications-stat-icon applications-icon-blue">
            <Users size={21} />
          </div>
          <div>
            <p>Shortlisted / Interview</p>
            <h2>{stats.shortlisted}</h2>
            <span>Progressing in recruitment</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-applications-stat-icon applications-icon-green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <p>Selected</p>
            <h2>{stats.selected}</h2>
            <span>Successfully selected</span>
          </div>
        </div>
      </div>

      <section className="admin-table-card admin-applications-table-card">
        <div className="admin-applications-section-heading">
          <div>
            <h2>All Applications</h2>
            <p>Student applications across all posted jobs.</p>
          </div>

          <span className="admin-applications-count">
            {filteredApplications.length}{" "}
            {filteredApplications.length === 1 ? "application" : "applications"}
          </span>
        </div>

        <div className="admin-table-toolbar admin-applications-toolbar">
          <label className="admin-search-box admin-applications-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search student, job, company, email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            className="admin-applications-status-filter"
            aria-label="Filter applications by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrapper admin-applications-table-wrapper">
          <table className="admin-table admin-applications-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>JOB / COMPANY</th>
                <th>APPLIED ON</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="admin-empty-cell">
                    <span className="admin-applications-loading">
                      <RefreshCw size={19} className="admin-applications-spin" />
                      Loading applications from PostgreSQL...
                    </span>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty-cell">
                    <div className="admin-applications-empty">
                      <FileText size={32} />
                      <h3>
                        {applications.length === 0
                          ? "No applications found"
                          : "No matching applications"}
                      </h3>
                      <p>
                        {applications.length === 0
                          ? "Student applications will appear here when they are submitted."
                          : "Try changing your search or status filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="admin-applications-student-cell">
                        <div className="admin-applications-avatar">
                          {(app.studentName || "?")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>{app.studentName}</strong>
                          <span>{app.studentEmail}</span>
                          <small>
                            {[app.degree, app.branch]
                              .filter(Boolean)
                              .join(" · ") || "Course not provided"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-applications-job-cell">
                        <strong>{app.jobTitle}</strong>
                        <span>
                          <Building2 size={13} />
                          {app.company}
                        </span>
                        <small>
                          <MapPin size={12} />
                          {app.location}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span className="admin-applications-date">
                        <CalendarDays size={14} />
                        {formatDate(app.appliedAt)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-applications-status status-${statusClass(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="View application"
                        aria-label={`View application from ${app.studentName}`}
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedApplication && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingId) {
              setSelectedApplication(null);
            }
          }}
        >
          <section
            className="admin-modal admin-applications-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-application-detail-title"
          >
            <div className="admin-modal-header">
              <div>
                <h2 id="admin-application-detail-title">
                  Application Details
                </h2>
                <p>Review the student's application information.</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                disabled={Boolean(savingId)}
                aria-label="Close application details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body admin-applications-detail-body">
              <div className="admin-applications-detail-profile">
                <div className="admin-applications-avatar admin-applications-avatar-large">
                  {selectedApplication.studentName
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h3>{selectedApplication.studentName}</h3>
                  <p>{selectedApplication.studentEmail}</p>
                </div>
              </div>

              <div className="admin-applications-detail-grid">
                <div>
                  <span>College</span>
                  <strong>{selectedApplication.college}</strong>
                </div>
                <div>
                  <span>Degree</span>
                  <strong>{selectedApplication.degree || "Not provided"}</strong>
                </div>
                <div>
                  <span>Branch</span>
                  <strong>{selectedApplication.branch || "Not provided"}</strong>
                </div>
                <div>
                  <span>Applied on</span>
                  <strong>{formatDate(selectedApplication.appliedAt)}</strong>
                </div>
              </div>

              <div className="admin-applications-detail-job">
                <h4>Job Information</h4>
                <p className="admin-applications-detail-job-title">
                  {selectedApplication.jobTitle}
                </p>
                <p>
                  <Building2 size={15} />
                  {selectedApplication.company}
                </p>
                <p>
                  <MapPin size={15} />
                  {selectedApplication.location}
                </p>
              </div>

              <div className="admin-applications-status-editor">
                <label htmlFor="application-status">
                  Application Status
                </label>
                <select
                  id="application-status"
                  value={selectedApplication.status}
                  disabled={savingId === selectedApplication.id}
                  onChange={(event) =>
                    void updateStatus(selectedApplication, event.target.value)
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                  {!statuses.includes(selectedApplication.status) && (
                    <option value={selectedApplication.status}>
                      {selectedApplication.status}
                    </option>
                  )}
                </select>

                {savingId === selectedApplication.id && (
                  <span className="admin-applications-saving">
                    Saving status...
                  </span>
                )}
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setSelectedApplication(null)}
                disabled={Boolean(savingId)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}