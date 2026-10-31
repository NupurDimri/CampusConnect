
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  IndianRupee,
  MapPin,
  Upload,
  Users,
  XCircle,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  department?: string | null;
  location: string;
  job_type: string;
  work_mode: string;
  salary?: string | null;
  deadline?: string | null;
  description: string;
  responsibilities?: string | null;
  eligibility?: string | null;
  skills?: string | null;
  status?: string;
  applicants?: number;
  created_at?: string;
};

type StudentProfile = {
  resumeName?: string | null;
  resumeUrl?: string | null;
};

type ApplicationResponse = {
  message?: string;
  error?: string;
  application?: {
    id: string;
  };
};

function formatDeadline(deadline?: string | null): string {
  if (!deadline?.trim()) {
    return "Not specified";
  }

  const datePart = deadline.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) {
    return "Not specified";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Not specified";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function JobInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
      <div className="mt-0.5 text-[#d77a5d]">{icon}</div>

      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 break-words font-medium text-[#173d2a]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function JobDetailsClient() {
  const params = useParams();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError("Invalid job ID.");
      return;
    }

    let cancelled = false;

    async function fetchJob() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/jobs", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Unable to load jobs.",
          );
        }

        const jobs: Job[] = Array.isArray(data)
          ? data
          : Array.isArray(data.jobs)
            ? data.jobs
            : [];

        const foundJob = jobs.find(
          (item) => String(item.id) === String(jobId),
        );

        if (!foundJob) {
          throw new Error("Job not found.");
        }

        if (!cancelled) {
          setJob(foundJob);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the job.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchStudentProfile() {
      try {
        const response = await fetch("/api/student/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && !cancelled) {
          setProfile(data.profile ?? null);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    fetchStudentProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleApply() {
    setApplicationMessage("");
    setApplicationError("");

    if (alreadyApplied || applicationSuccess) {
      setApplicationError("You have already applied for this job.");
      return;
    }

    if (!job) {
      setApplicationError("Job details are not available.");
      return;
    }

    if (!profile?.resumeUrl && !resumeFile) {
      setApplicationError(
        "Please upload a resume or add one to your student profile before applying.",
      );
      return;
    }

    if (resumeFile) {
      const allowedExtensions = [".pdf", ".doc", ".docx"];
      const fileName = resumeFile.name.toLowerCase();

      if (
        !allowedExtensions.some((extension) =>
          fileName.endsWith(extension),
        )
      ) {
        setApplicationError(
          "Please upload your resume in PDF, DOC, or DOCX format.",
        );
        return;
      }

      if (resumeFile.size > 5 * 1024 * 1024) {
        setApplicationError("Your resume must be smaller than 5 MB.");
        return;
      }
    }

    try {
      setApplying(true);

      const formData = new FormData();
      formData.append("jobId", job.id);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      const data: ApplicationResponse = await response.json();

      if (!response.ok) {
        const message =
          data.message ||
          data.error ||
          "Unable to submit your application.";

        if (
          response.status === 409 &&
          message.toLowerCase().includes("already applied")
        ) {
          setAlreadyApplied(true);
          setApplicationError("You have already applied for this job.");
          return;
        }

        throw new Error(message);
      }

      setApplicationSuccess(true);
      setAlreadyApplied(true);
      setApplicationMessage(
        data.message || "Your application has been submitted successfully!",
      );
      setResumeFile(null);
    } catch (err) {
      setApplicationError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your application.",
      );
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <section className="min-h-[60vh] px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 text-red-500" size={42} />

          <h1 className="text-2xl font-bold text-[#173d2a]">
            Unable to load job
          </h1>

          <p className="mt-3 text-gray-600">
            {error || "The requested job could not be found."}
          </p>

          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#173d2a] px-5 py-3 font-medium text-white transition hover:bg-[#24543c]"
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>
        </div>
      </section>
    );
  }

  const isActive = job.status?.toLowerCase() === "active";

  return (
    <section className="min-h-screen bg-[#f8f7f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#173d2a] transition hover:text-[#d77a5d]"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </Link>

        {/* Job heading */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#173d2a]/10 text-[#173d2a]">
                <Building2 size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#173d2a] sm:text-3xl">
                  {job.title}
                </h1>

                <p className="mt-2 font-medium text-gray-700">
                  {job.company}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#d77a5d]" />
                    {job.location || "Location not specified"}
                  </span>

                  {job.department && (
                    <span className="flex items-center gap-2">
                      <BriefcaseBusiness
                        size={16}
                        className="text-[#d77a5d]"
                      />
                      {job.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-green-600" : "bg-gray-500"
                }`}
              />
              {job.status || "Status unavailable"}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Job information */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#173d2a]">
                Job Information
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <JobInfo
                  icon={<BriefcaseBusiness size={20} />}
                  label="Job Type"
                  value={job.job_type || "Not specified"}
                />

                <JobInfo
                  icon={<Building2 size={20} />}
                  label="Work Mode"
                  value={job.work_mode || "Not specified"}
                />

                <JobInfo
                  icon={<IndianRupee size={20} />}
                  label="Salary"
                  value={job.salary?.trim() || "Not disclosed"}
                />

                <JobInfo
                  icon={<CalendarDays size={20} />}
                  label="Application Deadline"
                  value={formatDeadline(job.deadline)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#173d2a]">
                About the Job
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {job.description || "No job description provided."}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#173d2a]">
                <CheckCircle2 size={22} className="text-[#d77a5d]" />
                Responsibilities
              </h2>

              <div className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {job.responsibilities || "No responsibilities specified."}
              </div>
            </div>

            {/* Eligibility */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#173d2a]">
                <GraduationCap size={22} className="text-[#d77a5d]" />
                Eligibility Criteria
              </h2>

              <div className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {job.eligibility || "No eligibility criteria specified."}
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#173d2a]">
                Required Skills
              </h2>

              {job.skills?.trim() ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills
                    .split(/[,;\n]/)
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-[#173d2a]/10 px-4 py-2 text-sm font-medium text-[#173d2a]"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="mt-4 text-gray-600">
                  No specific skills listed.
                </p>
              )}
            </div>
          </div>

          {/* Application sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#173d2a]">
                Apply for this Job
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Submit your resume to apply for this opportunity.
              </p>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <CalendarDays
                    size={17}
                    className="shrink-0 text-[#d77a5d]"
                  />
                  <span>Deadline: {formatDeadline(job.deadline)}</span>
                </p>

                <p className="flex items-center gap-2">
                  <Users
                    size={17}
                    className="shrink-0 text-[#d77a5d]"
                  />
                  <span>{job.applicants ?? 0} applicants</span>
                </p>

                <p className="flex items-center gap-2">
                  <Clock
                    size={17}
                    className="shrink-0 text-[#d77a5d]"
                  />
                  <span>{job.work_mode || "Work mode not specified"}</span>
                </p>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <label
                  htmlFor="resume"
                  className="mb-2 block text-sm font-semibold text-[#173d2a]"
                >
                  Your Resume
                </label>

                {profileLoading ? (
                  <p className="text-sm text-gray-500">
                    Checking your profile resume...
                  </p>
                ) : profile?.resumeUrl ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                    <div className="flex items-start gap-2">
                      <FileText
                        size={20}
                        className="mt-0.5 shrink-0 text-green-700"
                      />

                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-green-800">
                          {profile.resumeName || "Resume available in profile"}
                        </p>

                        <p className="mt-1 text-xs text-green-700">
                          Your profile resume will be used unless you select
                          another file below.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    No resume found in your profile. Upload one below to apply.
                  </p>
                )}

                <label
                  htmlFor="resume"
                  className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 transition hover:border-[#173d2a] hover:bg-[#173d2a]/5"
                >
                  <Upload size={18} />
                  <span>
                    {resumeFile ? resumeFile.name : "Choose a resume file"}
                  </span>
                </label>

                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(event) => {
                    setResumeFile(event.target.files?.[0] ?? null);
                    setApplicationError("");
                    setApplicationMessage("");
                  }}
                />

                <p className="mt-2 text-xs text-gray-500">
                  PDF, DOC, or DOCX · Maximum 5 MB
                </p>
              </div>

              {applicationError && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {applicationError}
                </div>
              )}

              {applicationMessage && (
                <div
                  role="status"
                  className={`mt-4 rounded-xl border p-3 text-sm ${
                    applicationSuccess
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-blue-200 bg-blue-50 text-blue-800"
                  }`}
                >
                  {applicationMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={
                  applying ||
                  !isActive ||
                  applicationSuccess ||
                  alreadyApplied
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#24543c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : alreadyApplied || applicationSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    Already Applied
                  </>
                ) : !isActive ? (
                  "Applications Closed"
                ) : (
                  "Apply Now"
                )}
              </button>

              {alreadyApplied && (
                <p className="mt-3 text-center text-sm text-green-700">
                  You have already applied for this job.
                </p>
              )}

              {!isActive && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  This job is not currently accepting applications.
                </p>
              )}

              <p className="mt-4 text-center text-xs text-gray-500">
                By applying, you agree to share your application details with
                the recruiter.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
