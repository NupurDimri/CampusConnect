"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  department: string | null;
  location: string;
  job_type: string;
  work_mode: string;
  salary: string | null;
  deadline: string | null;
  description: string;
  responsibilities: string | null;
  eligibility: string | null;
  skills: string | null;
  status: "Active" | "Draft" | "Closed";
  applicants: number;
  created_at: string;
};

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  // Fetch the selected job from PostgreSQL.
  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      setIsLoading(true);
      setError("");
      setJob(null);

      try {
        const response = await fetch("/api/jobs");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load job details."
          );
        }

        const jobs: Job[] = result.jobs || [];

        const selectedJob = jobs.find(
          (item) => item.id === jobId
        );

        if (!cancelled) {
          if (selectedJob) {
            setJob(selectedJob);
          } else {
            setError("This job does not exist or is no longer available.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load job details. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (jobId) {
      loadJob();
    }

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // Format the posting date.
  function formatPostedDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Format the application deadline.
  function formatDeadline(date: string | null) {
    if (!date) return "Not specified";

    const deadlineDate = date.slice(0, 10);
    const [year, month, day] = deadlineDate.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Convert database text fields into displayable lists.
  function parseList(value: string | null): string[] {
    if (!value?.trim()) return [];

    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // Loading state.
  if (isLoading) {
    return (
      <section className="job-not-found">
        <div className="container">
          <Clock3 size={42} />
          <h1>Loading job details...</h1>
          <p>Please wait while we retrieve this opportunity.</p>
        </div>
      </section>
    );
  }

  // Error or job-not-found state.
  if (error || !job) {
    return (
      <section className="job-not-found">
        <div className="container">
          <BriefcaseBusiness size={42} />
          <h1>{error ? "Unable to load job" : "Job not found"}</h1>
          <p>
            {error ||
              "This opportunity may not exist or may have been removed."}
          </p>

          <Link href="/jobs" className="button button-primary">
            <ArrowLeft size={17} />
            Back to jobs
          </Link>
        </div>
      </section>
    );
  }

  const responsibilities = parseList(job.responsibilities);
  const eligibility = parseList(job.eligibility);
  const skills = parseList(job.skills);

  const isActive = job.status === "Active";

  // Demo application handler.
  function handleApply() {
    setApplied(true);
  }

  return (
    <div className="job-details-page">
      {/* Job banner */}
      <section className="job-details-banner">
        <div className="container">
          <Link href="/jobs" className="back-to-jobs">
            <ArrowLeft size={17} />
            Back to all jobs
          </Link>

          <div className="job-details-heading">
            <div className="job-details-company-icon">
              <Building2 size={32} />
            </div>

            <div className="job-details-title">
              <span className="section-kicker">
                {job.department || "Career Opportunity"}
              </span>

              <h1>{job.title}</h1>

              <div className="job-details-subtitle">
                <span>
                  <Building2 size={16} />
                  {job.company}
                </span>

                <span>
                  <MapPin size={16} />
                  {job.location}
                </span>

                <span>
                  <BriefcaseBusiness size={16} />
                  {job.job_type}
                </span>
              </div>
            </div>
          </div>

          <div className="job-details-banner-bottom">
            <span className="job-details-salary">
              <IndianRupee size={19} />
              {job.salary || "Salary not disclosed"}
            </span>

            <span className="job-posted">
              <Clock3 size={16} />
              Posted {formatPostedDate(job.created_at)}
            </span>
          </div>
        </div>
      </section>

      {/* Job content */}
      <section className="job-details-content">
        <div className="container job-details-layout">
          {/* Main information */}
          <div className="job-details-main">
            <article className="job-info-card">
              <h2>About this role</h2>

              <p className="job-info-description">
                {job.description}
              </p>

              {responsibilities.length > 0 && (
                <>
                  <h3>Key responsibilities</h3>

                  <ul className="job-detail-list">
                    {responsibilities.map((item, index) => (
                      <li key={`${index}-${item}`}>
                        <CheckCircle2 size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {eligibility.length > 0 && (
                <>
                  <h3>Eligibility requirements</h3>

                  <ul className="job-detail-list">
                    {eligibility.map((item, index) => (
                      <li key={`${index}-${item}`}>
                        <CheckCircle2 size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {skills.length > 0 && (
                <>
                  <h3>Required skills</h3>

                  <div className="job-detail-skills">
                    {skills.map((skill, index) => (
                      <span key={`${index}-${skill}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <h3>Work arrangement</h3>

              <div className="job-detail-skills">
                <span>{job.work_mode}</span>
                <span>{job.job_type}</span>
              </div>
            </article>
          </div>

          {/* Application sidebar */}
          <aside className="job-details-sidebar">
            <div className="job-apply-card">
              <span className="section-kicker">APPLICATION</span>

              <h2>Interested in this role?</h2>

              <p>
                Review the requirements and apply when you are ready
                to take the next step.
              </p>

              <div className="job-deadline">
                <CalendarDays size={19} />

                <div>
                  <small>Application deadline</small>
                  <strong>{formatDeadline(job.deadline)}</strong>
                </div>
              </div>

              {!isActive ? (
                <div className="application-success" role="status">
                  <Clock3 size={22} />

                  <div>
                    <strong>Applications are closed</strong>
                    <p>
                      This job is not currently accepting applications.
                    </p>
                  </div>
                </div>
              ) : applied ? (
                <div className="application-success" role="status">
                  <CheckCircle2 size={22} />

                  <div>
                    <strong>Demo application recorded!</strong>

                    <p>
                      This is a frontend demonstration. Your application
                      has not been saved to the database.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-primary job-apply-button"
                  onClick={handleApply}
                >
                  Apply Now <ArrowUpRight size={18} />
                </button>
              )}

              <p className="job-apply-note">
                <ShieldCheck size={16} />

                Your application details will be handled securely once
                registration and backend services are connected.
              </p>
            </div>

            {/* Company card */}
            <div className="job-company-card">
              <div className="job-company-card-icon">
                <GraduationCap size={25} />
              </div>

              <h3>{job.company}</h3>

              <p>
                Explore career opportunities and learn more about
                companies hiring through Campus Connect.
              </p>

              <Link href="/companies" className="job-company-link">
                Explore companies <ArrowUpRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}