"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  Users,
  AlertCircle,
  CheckCircle2,
  BriefcaseBusiness,
} from "lucide-react";

type Applicant = {
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
  salary?: string;
};

const STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Rejected",
  "Selected",
];

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId")?.trim() ?? "";

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplicants = useCallback(async () => {
    if (!jobId) {
      setApplicants([]);
      setError(
        "No job was selected. Return to the recruiter dashboard and select a job."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotice("");

      console.log("Fetching applicants for job ID:", jobId);

      const response = await fetch(
        `/api/applications?jobId=${encodeURIComponent(jobId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: unknown = await response.json();

      console.log("Applications API response:", data);

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Unable to load applicants.";

        throw new Error(message);
      }

      // The API may return an array directly or an object containing applications.
      let applications: unknown[] | null = null;

      if (Array.isArray(data)) {
        applications = data;
      } else if (
        typeof data === "object" &&
        data !== null &&
        "applications" in data &&
        Array.isArray(data.applications)
      ) {
        applications = data.applications;
      }

      if (!applications) {
        throw new Error(
          "Unexpected response from the server. Check the applications API."
        );
      }

      // Normalize the status field to application_status for consistent rendering.
      const normalizedApplicants: Applicant[] = applications.map(
        (item: unknown) => {
          if (typeof item !== "object" || item === null) {
            throw new Error("The server returned an invalid application.");
          }

          const record = item as Record<string, unknown>;

          const status =
            typeof record.application_status === "string"
              ? record.application_status
              : typeof record.status === "string"
                ? record.status
                : "Applied";

          return {
            id: String(record.id ?? ""),
            job_id: String(record.job_id ?? ""),
            student_email: String(record.student_email ?? ""),
            application_status: status,
            applied_at: String(record.applied_at ?? ""),
            title: String(record.title ?? "Job Opening"),
            company: String(record.company ?? ""),
            department:
              typeof record.department === "string"
                ? record.department
                : undefined,
            location:
              typeof record.location === "string"
                ? record.location
                : undefined,
            job_type:
              typeof record.job_type === "string"
                ? record.job_type
                : undefined,
            work_mode:
              typeof record.work_mode === "string"
                ? record.work_mode
                : undefined,
            salary:
              typeof record.salary === "string" ||
              typeof record.salary === "number"
                ? String(record.salary)
                : undefined,
          };
        }
      );

      console.log("Normalized applicants:", normalizedApplicants);

      setApplicants(normalizedApplicants);
    } catch (err) {
      console.error("Error loading applicants:", err);

      setApplicants([]);
      setError(
        err instanceof Error ? err.message : "Unable to load applicants."
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void loadApplicants();
  }, [loadApplicants]);

  async function updateStatus(applicationId: string, status: string) {
    try {
      setUpdatingId(applicationId);
      setNotice("");
      setError("");

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
        throw new Error(
          data.error || "Unable to update application status."
        );
      }

      // Update the page only after the API confirms the change.
      setApplicants((previous) =>
        previous.map((applicant) =>
          applicant.id === applicationId
            ? { ...applicant, application_status: status }
            : applicant
        )
      );

      setNotice(`Application status updated to "${status}".`);
    } catch (err) {
      console.error("Error updating application status:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const job = applicants[0];

  const underReviewCount = applicants.filter(
    (applicant) => applicant.application_status === "Under Review"
  ).length;

  const shortlistedCount = applicants.filter(
    (applicant) => applicant.application_status === "Shortlisted"
  ).length;

  return (
    <div className="recruiter-page">
      <div className="recruiter-container">
        <main className="recruiter-main">
          <Link href="/recruiter" className="recruiter-nav-link">
            <ArrowLeft size={18} />
            Back to Recruiter Dashboard
          </Link>

          <header className="recruiter-topbar">
            <div>
              <span className="recruiter-eyebrow">
                RECRUITER WORKSPACE
              </span>

              <h1>Job Applicants</h1>

              <p>
                Review applications and update each candidate&apos;s hiring
                status.
              </p>
            </div>
          </header>

          {job && (
            <section className="recruiter-welcome">
              <div>
                <span>JOB OPENING</span>
                <h2>{job.title}</h2>
                <p>{job.company}</p>
              </div>

              <div className="recruiter-welcome-art">
                <BriefcaseBusiness size={54} />
              </div>
            </section>
          )}

          <section className="recruiter-stats">
            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon green">
                <Users size={21} />
              </div>

              <span>Total Applicants</span>
              <strong>{loading ? "—" : applicants.length}</strong>
              <small>Applications received</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon orange">
                <Clock3 size={21} />
              </div>

              <span>Under Review</span>
              <strong>{loading ? "—" : underReviewCount}</strong>
              <small>Awaiting review</small>
            </div>

            <div className="recruiter-stat-card">
              <div className="recruiter-stat-icon blue">
                <CheckCircle2 size={21} />
              </div>

              <span>Shortlisted</span>
              <strong>{loading ? "—" : shortlistedCount}</strong>
              <small>Potential candidates</small>
            </div>
          </section>

          {notice && (
            <div className="recruiter-notice" role="status">
              <CheckCircle2 size={18} />
              {notice}
            </div>
          )}

          {error && (
            <div className="recruiter-notice" role="alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <section className="recruiter-jobs-panel">
            <div className="recruiter-panel-heading">
              <div>
                <h2>Applications</h2>
                <p>Manage the candidates who applied for this job.</p>
              </div>
            </div>

            {loading ? (
              <div className="recruiter-empty-state">
                <Clock3 size={28} />
                <h3>Loading applicants...</h3>
                <p>Retrieving applications from PostgreSQL.</p>
              </div>
            ) : error && applicants.length === 0 ? (
              <div className="recruiter-empty-state">
                <AlertCircle size={28} />
                <h3>Unable to load applicants</h3>
                <p>{error}</p>

                <button type="button" onClick={() => void loadApplicants()}>
                  Try again
                </button>
              </div>
            ) : applicants.length === 0 ? (
              <div className="recruiter-empty-state">
                <Users size={28} />
                <h3>No applicants yet</h3>
                <p>
                  No applications were returned for this job. Verify the job
                  ID and API response.
                </p>

                <button type="button" onClick={() => void loadApplicants()}>
                  Refresh applicants
                </button>
              </div>
            ) : (
              <div className="recruiter-job-list">
                {applicants.map((applicant) => (
                  <article className="recruiter-job-row" key={applicant.id}>
                    <div className="recruiter-job-icon">
                      <Mail size={22} />
                    </div>

                    <div className="recruiter-job-info">
                      <h3>{applicant.student_email}</h3>

                      <p>
                        <CalendarDays
                          size={14}
                          style={{
                            display: "inline",
                            marginRight: 6,
                            verticalAlign: "middle",
                          }}
                        />

                        Applied{" "}
                        {applicant.applied_at &&
                        !Number.isNaN(
                          new Date(applicant.applied_at).getTime()
                        )
                          ? new Date(
                              applicant.applied_at
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Date unavailable"}
                      </p>

                      <span className="recruiter-job-status">
                        {applicant.application_status}
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor={`status-${applicant.id}`}
                        className="sr-only"
                      >
                        Update application status
                      </label>

                      <select
                        id={`status-${applicant.id}`}
                        value={applicant.application_status}
                        disabled={updatingId === applicant.id}
                        onChange={(event) =>
                          void updateStatus(
                            applicant.id,
                            event.target.value
                          )
                        }
                        aria-label={`Update status for ${applicant.student_email}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingId === applicant.id && (
                        <small>Saving...</small>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="recruiter-list-footer">
              {loading
                ? "Loading applications..."
                : `${applicants.length} applicant(s) for this job.`}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default function RecruiterApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="recruiter-page">
          <div className="recruiter-container">
            <main className="recruiter-main">
              Loading applicant page...
            </main>
          </div>
        </div>
      }
    >
      <ApplicantsContent />
    </Suspense>
  );
}
