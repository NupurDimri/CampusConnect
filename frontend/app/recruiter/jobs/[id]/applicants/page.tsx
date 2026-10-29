"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  BriefcaseBusiness,
  Mail,
} from "lucide-react";

type Application = {
  id: string;
  job_id: string;
  student_email: string;
  application_status: string;
  applied_at: string;
  title: string;
  company: string;
  department?: string;
  location?: string;
  job_type?: string;
  work_mode?: string;
  salary?: string | number | null;
};

const STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Rejected",
  "Selected",
];

type ManageApplicantsPageProps = {
  params: Promise<{ id: string }>;
};

export default function ManageApplicantsPage({
  params,
}: ManageApplicantsPageProps) {
  const { id: jobId } = use(params);

  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobTitle, setJobTitle] = useState("Applicants");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchApplications = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/applications?jobId=${encodeURIComponent(jobId)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load applicants.");
      }

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected response.");
      }

      setApplications(data);

      if (data.length > 0 && data[0].title) {
        setJobTitle(data[0].title);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load applicants."
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !searchText ||
        application.student_email.toLowerCase().includes(searchText) ||
        application.title?.toLowerCase().includes(searchText) ||
        application.company?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        application.application_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: applications.length,
      applied: applications.filter(
        (application) => application.application_status === "Applied"
      ).length,
      review: applications.filter(
        (application) => application.application_status === "Under Review"
      ).length,
      shortlisted: applications.filter(
        (application) => application.application_status === "Shortlisted"
      ).length,
      selected: applications.filter(
        (application) => application.application_status === "Selected"
      ).length,
    }),
    [applications]
  );

  async function updateStatus(applicationId: string, status: string) {
    setUpdatingId(applicationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update application status.");
      }

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? { ...application, application_status: status }
            : application
        )
      );

      setSuccess(`Application status updated to "${status}".`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(date: string) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusClass(status: string) {
    switch (status) {
      case "Shortlisted":
      case "Selected":
        return "applicant-status-success";
      case "Rejected":
        return "applicant-status-danger";
      case "Under Review":
      case "Interview Scheduled":
        return "applicant-status-review";
      default:
        return "applicant-status-pending";
    }
  }

  return (
    <div className="applicants-page">
      <div className="applicants-container">
        <Link href="/recruiter" className="applicants-back">
          <ArrowLeft size={18} />
          Back to Recruiter Dashboard
        </Link>

        <div className="applicants-heading">
          <div>
            <p className="applicants-eyebrow">RECRUITER WORKSPACE</p>
            <h1>Manage Applicants</h1>
            <p className="applicants-subtitle">
              Review applications and update candidate progress.
            </p>
            <p className="applicants-job-title">
              <BriefcaseBusiness size={17} />
              {jobTitle}
            </p>
          </div>

          <button
            type="button"
            className="applicants-refresh"
            onClick={fetchApplications}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && <div className="applicants-alert applicants-alert-error">{error}</div>}
        {success && (
          <div className="applicants-alert applicants-alert-success">
            {success}
          </div>
        )}

        <div className="applicants-stats">
          <div className="applicants-stat-card">
            <span className="applicants-stat-icon">
              <Users size={20} />
            </span>
            <div>
              <p>Total Applicants</p>
              <h2>{counts.total}</h2>
            </div>
          </div>

          <div className="applicants-stat-card">
            <span className="applicants-stat-icon">
              <Clock size={20} />
            </span>
            <div>
              <p>Under Review</p>
              <h2>{counts.review}</h2>
            </div>
          </div>

          <div className="applicants-stat-card">
            <span className="applicants-stat-icon">
              <CheckCircle size={20} />
            </span>
            <div>
              <p>Shortlisted</p>
              <h2>{counts.shortlisted}</h2>
            </div>
          </div>

          <div className="applicants-stat-card">
            <span className="applicants-stat-icon">
              <XCircle size={20} />
            </span>
            <div>
              <p>Selected</p>
              <h2>{counts.selected}</h2>
            </div>
          </div>
        </div>

        <section className="applicants-panel">
          <div className="applicants-panel-heading">
            <div>
              <h2>Applications</h2>
              <p>
                {filteredApplications.length} of {applications.length}{" "}
                applications
              </p>
            </div>
          </div>

          <div className="applicants-filters">
            <div className="applicants-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search by student email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search applicants"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by application status"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="applicants-empty">Loading applicants...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="applicants-empty">
              <Users size={36} />
              <h3>
                {applications.length === 0
                  ? "No applicants yet"
                  : "No matching applicants"}
              </h3>
              <p>
                {applications.length === 0
                  ? "Applications for this job will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="applicants-table-wrapper">
              <table className="applicants-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Applied On</th>
                    <th>Current Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="applicant-student">
                          <span className="applicant-avatar">
                            {application.student_email
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <div>
                            <strong>
                              {application.student_email.split("@")[0]}
                            </strong>
                            <span className="applicant-email">
                              <Mail size={13} />
                              {application.student_email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{formatDate(application.applied_at)}</td>

                      <td>
                        <span
                          className={`applicant-status ${statusClass(
                            application.application_status
                          )}`}
                        >
                          {application.application_status}
                        </span>
                      </td>

                      <td>
                        <select
                          className="applicant-status-select"
                          value={application.application_status}
                          disabled={updatingId === application.id}
                          onChange={(event) =>
                            updateStatus(application.id, event.target.value)
                          }
                          aria-label={`Update status for ${application.student_email}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === application.id && (
                          <span className="applicant-updating">
                            Saving...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}