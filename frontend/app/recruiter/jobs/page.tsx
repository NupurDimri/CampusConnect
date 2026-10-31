"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Edit3,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

type JobStatus = "Active" | "Draft" | "Closed";

type Job = {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  salary: string;
  deadline: string;
  description: string;
  status: JobStatus;
  postedAt: string;
  applicants: number;
};

type ApiJob = {
  id: string | number;
  title?: string;
  company?: string;
  department?: string;
  location?: string;
  job_type?: string;
  jobType?: string;
  work_mode?: string;
  workMode?: string;
  salary?: string | number | null;
  deadline?: string | null;
  description?: string;
  status?: string;
  created_at?: string | null;
  posted_at?: string | null;
  applicants?: number;
};

type ApiApplication = {
  id?: string | number;
  job_id?: string | number;
  jobId?: string | number;
};

const validStatuses: JobStatus[] = ["Active", "Draft", "Closed"];

function normalizeStatus(value?: string): JobStatus {
  const normalized = value?.toLowerCase();

  if (normalized === "draft") return "Draft";
  if (normalized === "closed") return "Closed";

  return "Active";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/jobs?mine=true", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load your jobs.");
      }

      const apiJobs: ApiJob[] = Array.isArray(result.jobs)
        ? result.jobs
        : Array.isArray(result)
          ? result
          : [];

      const normalizedJobs: Job[] = apiJobs.map((item) => ({
        id: String(item.id),
        title: item.title ?? "Untitled Job",
        company: item.company ?? "Company not specified",
        department: item.department ?? "",
        location: item.location ?? "Location not specified",
        jobType: item.job_type ?? item.jobType ?? "Full-time",
        workMode: item.work_mode ?? item.workMode ?? "On-site",
        salary:
          item.salary === null || item.salary === undefined
            ? ""
            : String(item.salary),
        deadline: item.deadline ? String(item.deadline).slice(0, 10) : "",
        description: item.description ?? "",
        status: normalizeStatus(item.status),
        postedAt: item.created_at ?? item.posted_at ?? "",
        applicants: Number(item.applicants ?? 0),
      }));

      // Fetch application counts for jobs if the API does not provide them.
      const jobsWithCounts = await Promise.all(
        normalizedJobs.map(async (job) => {
          try {
            const response = await fetch(
              `/api/applications?jobId=${encodeURIComponent(job.id)}`,
              { cache: "no-store" }
            );

            if (!response.ok) return job;

            const result = await response.json();

            if (!Array.isArray(result)) return job;

            const count = result.filter(
              (application: ApiApplication) =>
                String(application.job_id ?? application.jobId ?? job.id) ===
                job.id
            ).length;

            return { ...job, applicants: count };
          } catch {
            return job;
          }
        })
      );

      setJobs(jobsWithCounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading jobs."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const activeCount = jobs.filter((job) => job.status === "Active").length;
  const draftCount = jobs.filter((job) => job.status === "Draft").length;
  const closedCount = jobs.filter((job) => job.status === "Closed").length;

  async function updateStatus(job: Job) {
    if (job.status === "Draft") {
      setNotice("Draft jobs cannot be activated from this button.");
      return;
    }

    const newStatus: JobStatus =
      job.status === "Active" ? "Closed" : "Active";

    setBusyJobId(job.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: job.id,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update job status.");
      }

      setJobs((previous) =>
        previous.map((item) =>
          item.id === job.id ? { ...item, status: newStatus } : item
        )
      );

      setNotice(`"${job.title}" is now ${newStatus.toLowerCase()}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update job status."
      );
    } finally {
      setBusyJobId(null);
    }
  }

  async function deleteJob() {
    if (!jobToDelete) return;

    const job = jobToDelete;

    setBusyJobId(job.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/jobs?id=${encodeURIComponent(job.id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete this job.");
      }

      setJobs((previous) =>
        previous.filter((item) => item.id !== job.id)
      );

      setNotice(`"${job.title}" was deleted successfully.`);
      setJobToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this job."
      );
    } finally {
      setBusyJobId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/recruiter"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#173D2A] hover:text-[#D77A5D]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#D77A5D]">
              Recruiter Workspace
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#173D2A] sm:text-4xl">
              Manage Jobs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Create opportunities, manage job postings, and keep track of
              applicants.
            </p>
          </div>

          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173D2A] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#24543D]"
          >
            <Plus size={19} />
            Add New Job
          </Link>
        </header>

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Jobs"
            value={jobs.length}
            icon={<BriefcaseBusiness size={21} />}
            description="All your job postings"
          />

          <StatCard
            title="Active Jobs"
            value={activeCount}
            icon={<Eye size={21} />}
            description="Currently published"
          />

          <StatCard
            title="Draft Jobs"
            value={draftCount}
            icon={<Building2 size={21} />}
            description="Not yet published"
          />

          <StatCard
            title="Closed Jobs"
            value={closedCount}
            icon={<CalendarDays size={21} />}
            description="No longer accepting applications"
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#173D2A]">
                  Your Job Postings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredJobs.length} of {jobs.length} jobs displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search jobs..."
                    aria-label="Search jobs"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#173D2A] focus:ring-2 focus:ring-[#173D2A]/10 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter jobs by status"
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#173D2A]"
                >
                  <option value="All">All statuses</option>
                  {validStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => void loadJobs()}
                  disabled={isLoading}
                  title="Refresh jobs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={isLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <RefreshCw
                size={30}
                className="mb-4 animate-spin text-[#173D2A]"
              />
              <p className="font-medium text-gray-700">Loading your jobs...</p>
              <p className="mt-1 text-sm text-gray-500">
                Retrieving your job postings.
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173D2A]/5 text-[#173D2A]">
                <BriefcaseBusiness size={27} />
              </div>

              <h3 className="text-lg font-semibold text-[#173D2A]">
                {jobs.length === 0
                  ? "No job postings yet"
                  : "No matching jobs found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {jobs.length === 0
                  ? "Create your first job posting to start receiving applications from students."
                  : "Try another search term or change the selected status filter."}
              </p>

              {jobs.length === 0 && (
                <Link
                  href="/recruiter/jobs/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173D2A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24543D]"
                >
                  <Plus size={17} />
                  Create Your First Job
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Job Details</th>
                      <th className="px-5 py-4 font-semibold">Location</th>
                      <th className="px-5 py-4 font-semibold">Applicants</th>
                      <th className="px-5 py-4 font-semibold">Deadline</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-[#173D2A]">
                            {job.title}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {job.company}
                            {job.department ? ` · ${job.department}` : ""}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {job.jobType} · {job.workMode}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={15} className="shrink-0" />
                            {job.location}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <Link
                            href={`/recruiter/jobs/${encodeURIComponent(job.id)}/applicants`}
                            className="inline-flex items-center gap-2 font-semibold text-[#173D2A] hover:text-[#D77A5D]"
                          >
                            <Users size={17} />
                            {job.applicants}
                          </Link>
                        </td>

                        <td className="px-5 py-5 text-sm text-gray-600">
                          {formatDate(job.deadline)}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={job.status} />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/recruiter/jobs/${encodeURIComponent(job.id)}/edit`}
                              title="Edit job"
                              aria-label={`Edit ${job.title}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-[#173D2A] hover:text-[#173D2A]"
                            >
                              <Edit3 size={16} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => void updateStatus(job)}
                              disabled={
                                busyJobId === job.id || job.status === "Draft"
                              }
                              title={
                                job.status === "Active"
                                  ? "Close job"
                                  : job.status === "Closed"
                                    ? "Reopen job"
                                    : "Publish this draft from the edit page"
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#173D2A] hover:text-[#173D2A] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {busyJobId === job.id
                                ? "Saving..."
                                : job.status === "Active"
                                  ? "Close"
                                  : job.status === "Closed"
                                    ? "Reopen"
                                    : "Draft"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setJobToDelete(job)}
                              disabled={busyJobId === job.id}
                              title="Delete job"
                              aria-label={`Delete ${job.title}`}
                              className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 sm:p-5 lg:hidden">
                {filteredJobs.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#173D2A]">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {job.company}
                        </p>
                      </div>

                      <StatusBadge status={job.status} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <MapPin size={16} />
                        {job.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <BriefcaseBusiness size={16} />
                        {job.jobType} · {job.workMode}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        Deadline: {formatDate(job.deadline)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <Link
                        href={`/recruiter/jobs/${encodeURIComponent(job.id)}/applicants`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#173D2A] hover:text-[#D77A5D]"
                      >
                        <Users size={16} />
                        {job.applicants} Applicants
                      </Link>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/recruiter/jobs/${encodeURIComponent(job.id)}/edit`}
                          title="Edit job"
                          aria-label={`Edit ${job.title}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:text-[#173D2A]"
                        >
                          <Edit3 size={16} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => void updateStatus(job)}
                          disabled={
                            busyJobId === job.id || job.status === "Draft"
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold disabled:opacity-40"
                        >
                          {job.status === "Active" ? "Close" : "Reopen"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setJobToDelete(job)}
                          disabled={busyJobId === job.id}
                          aria-label={`Delete ${job.title}`}
                          className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Job changes are sent to your database API.
            </p>

            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#173D2A] hover:text-[#D77A5D]"
            >
              <Plus size={17} />
              Post another job
            </Link>
          </div>
        </section>
      </div>

      {jobToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyJobId) {
              setJobToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-job-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2
              id="delete-job-title"
              className="text-xl font-bold text-[#173D2A]"
            >
              Delete this job?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              You are about to delete <strong>{jobToDelete.title}</strong>.
              This action may be permanent and could affect related
              applications, depending on your database constraints.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                disabled={busyJobId === jobToDelete.id}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void deleteJob()}
                disabled={busyJobId === jobToDelete.id}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busyJobId === jobToDelete.id
                  ? "Deleting..."
                  : "Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[#173D2A]">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173D2A]/5 text-[#173D2A]">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">{description}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const classes: Record<JobStatus, string> = {
    Active: "bg-green-50 text-green-700 ring-green-200",
    Draft: "bg-amber-50 text-amber-700 ring-amber-200",
    Closed: "bg-gray-100 text-gray-600 ring-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes[status]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}