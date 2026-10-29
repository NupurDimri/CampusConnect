"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Send,
  Users,
  AlertCircle,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  department?: string;
  location: string;
  job_type: string;
  work_mode: string;
  salary?: string;
  deadline?: string | null;
  description: string;
  responsibilities?: string;
  eligibility?: string;
  skills?: string;
  status: string;
  applicants?: number;
  created_at?: string;
};

type ApplicationResponse = {
  message?: string;
  error?: string;
  application?: {
    id: string;
    job_id: string;
    student_email: string;
    status: string;
  };
};

// Temporary email for testing.
// Replace this with the logged-in student's email when authentication is implemented.
const STUDENT_EMAIL = "student@example.com";

export default function JobDetailsClient() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationError, setApplicationError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchJob() {
      try {
        setLoading(true);
        setPageError("");

        const response = await fetch("/api/jobs", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load job details.");
        }

        const jobs: Job[] = Array.isArray(data)
          ? data
          : Array.isArray(data.jobs)
            ? data.jobs
            : [];

        const foundJob = jobs.find((item) => item.id === jobId);

        if (!foundJob) {
          if (!cancelled) {
            setPageError("The job you're looking for could not be found.");
          }
          return;
        }

        if (!cancelled) {
          setJob(foundJob);
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Something went wrong while loading the job."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (jobId) {
      fetchJob();
    }

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  async function handleApply() {
    if (!job) return;

    setIsSubmitting(true);
    setApplicationMessage("");
    setApplicationError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          studentEmail: STUDENT_EMAIL,
        }),
      });

      const data: ApplicationResponse = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setApplied(true);
          setApplicationMessage(
            data.error || "You have already applied for this job."
          );
        } else {
          setApplicationError(
            data.error || "Unable to submit your application."
          );
        }

        return;
      }

      setApplied(true);
      setApplicationMessage(
        data.message || "Your application was submitted successfully!"
      );
    } catch {
      setApplicationError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f8f7f4] px-6">
        <p className="text-lg font-medium text-[#173d2a]">
          Loading job details...
        </p>
      </main>
    );
  }

  if (pageError || !job) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f8f7f4] px-6">
        <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#d77a5d]" />

          <h1 className="mb-3 text-2xl font-bold text-[#173d2a]">
            Job Not Found
          </h1>

          <p className="mb-6 text-gray-600">
            {pageError || "This job may have been removed or is unavailable."}
          </p>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg bg-[#173d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#24533b]"
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  const isActive = job.status?.toLowerCase() === "active";

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/jobs"
          className="mb-8 inline-flex items-center gap-2 font-medium text-[#173d2a] transition hover:text-[#d77a5d]"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main job details */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {job.status}
                </span>

                {job.department && (
                  <span className="rounded-full bg-[#f8f7f4] px-3 py-1 text-sm text-gray-700">
                    {job.department}
                  </span>
                )}
              </div>

              <h1 className="mb-3 text-3xl font-bold leading-tight text-[#173d2a] sm:text-4xl">
                {job.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-gray-600">
                <span className="flex items-center gap-2">
                  <Building2 size={18} className="text-[#d77a5d]" />
                  {job.company}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#d77a5d]" />
                  {job.location}
                </span>
              </div>

              <div className="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
                <JobInfo
                  icon={<BriefcaseBusiness size={20} />}
                  label="Job Type"
                  value={job.job_type}
                />

                <JobInfo
                  icon={<Building2 size={20} />}
                  label="Work Mode"
                  value={job.work_mode}
                />

                <JobInfo
                  icon={<GraduationCap size={20} />}
                  label="Salary"
                  value={job.salary || "Not specified"}
                />

                <JobInfo
                  icon={<CalendarDays size={20} />}
                  label="Application Deadline"
                  value={
                    job.deadline
                      ? new Date(`${job.deadline}T00:00:00`).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Not specified"
                  }
                />
              </div>
            </div>

            <DetailSection
              title="About the Job"
              content={job.description}
            />

            {job.responsibilities && (
              <DetailSection
                title="Responsibilities"
                content={job.responsibilities}
              />
            )}

            {job.eligibility && (
              <DetailSection
                title="Eligibility Criteria"
                content={job.eligibility}
              />
            )}

            {job.skills && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-xl font-bold text-[#173d2a]">
                  Required Skills
                </h2>

                <div className="flex flex-wrap gap-2">
                  {job.skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-[#f8f7f4] px-4 py-2 text-sm font-medium text-[#173d2a]"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </section>

          {/* Application panel */}
          <aside>
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-bold text-[#173d2a]">
                Interested in this role?
              </h2>

              <p className="mb-6 text-sm leading-6 text-gray-600">
                Submit your application to express your interest in this
                opportunity.
              </p>

              {applicationMessage && (
                <div
                  role="status"
                  className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{applicationMessage}</p>
                </div>
              )}

              {applicationError && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{applicationError}</p>
                </div>
              )}

              {!isActive ? (
                <div className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-600">
                  Applications are closed
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isSubmitting || applied}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#24533b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Clock size={18} />
                      Submitting...
                    </>
                  ) : applied ? (
                    <>
                      <CheckCircle2 size={18} />
                      Application Submitted
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Apply Now
                    </>
                  )}
                </button>
              )}

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Users size={17} className="text-[#d77a5d]" />
                  {job.applicants ?? 0} applicants
                </p>

                <p className="flex items-center gap-2">
                  <CalendarDays size={17} className="text-[#d77a5d]" />
                  {job.deadline
                    ? `Deadline: ${new Date(
                        `${job.deadline}T00:00:00`
                      ).toLocaleDateString("en-IN")}`
                    : "No deadline specified"}
                </p>
              </div>

              <p className="mt-5 text-xs leading-5 text-gray-500">
                Development note: applications currently use a temporary
                student email. We will connect this to the authenticated
                student's account when the login system is implemented.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function JobInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-[#d77a5d]">{icon}</span>

      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 font-semibold text-[#173d2a]">{value}</p>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-4 text-xl font-bold text-[#173d2a]">{title}</h2>

      <p className="whitespace-pre-line leading-7 text-gray-600">{content}</p>
    </section>
  );
}