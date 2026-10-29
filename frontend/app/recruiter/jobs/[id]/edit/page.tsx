
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  IndianRupee,
  MapPin,
  Save,
} from "lucide-react";

type JobForm = {
  title: string;
  company: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  salary: string;
  deadline: string;
  description: string;
  responsibilities: string;
  eligibility: string;
  skills: string;
  status: string;
};

const initialForm: JobForm = {
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
};

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params.id;

  const [form, setForm] = useState<JobForm>(initialForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();

    setToday(
      [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-")
    );

    async function loadJob() {
      try {
        const response = await fetch("/api/jobs");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load jobs.");
        }

        const job = (result.jobs || []).find(
          (item: { id: string }) => item.id === jobId
        );

        if (!job) {
          throw new Error("Job not found. It may have been deleted.");
        }

        setForm({
          title: job.title ?? "",
          company: job.company ?? "",
          department: job.department ?? "",
          location: job.location ?? "",
          jobType: job.job_type ?? "Full-time",
          workMode: job.work_mode ?? "On-site",
          salary: job.salary ?? "",
          deadline: job.deadline
            ? String(job.deadline).slice(0, 10)
            : "",
          description: job.description ?? "",
          responsibilities: job.responsibilities ?? "",
          eligibility: job.eligibility ?? "",
          skills: job.skills ?? "",
          status: job.status ?? "Active",
        });
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this job."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setMessage("");

    if (form.deadline && today && form.deadline < today) {
      setMessage("Please select today or a future application deadline.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: jobId,
          ...form,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update this job.");
      }

      setMessage("Job updated successfully!");

      window.setTimeout(() => {
        router.push("/recruiter");
        router.refresh();
      }, 1000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="post-job-page">
        <div className="post-job-container">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-job-page">
      <div className="post-job-container">
        <Link href="/recruiter" className="post-job-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="post-job-heading">
          <div className="post-job-heading-icon">
            <BriefcaseBusiness size={25} />
          </div>

          <div>
            <h1>Edit Job</h1>
            <p>Update the opportunity and save your changes.</p>
          </div>
        </div>

        <form className="post-job-form" onSubmit={handleSubmit}>
          <section className="post-job-section">
            <h2>
              <BriefcaseBusiness size={19} />
              Basic Information
            </h2>

            <div className="post-job-grid">
              <label>
                Job Title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Company Name *
                <span className="post-job-input-icon">
                  <Building2 size={17} />
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                  />
                </span>
              </label>

              <label>
                Department *
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Job Type *
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  required
                >
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </label>

              <label>
                Work Mode *
                <select
                  name="workMode"
                  value={form.workMode}
                  onChange={handleChange}
                  required
                >
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </label>

              <label>
                Location *
                <span className="post-job-input-icon">
                  <MapPin size={17} />
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </span>
              </label>

              <label>
                Salary / Stipend
                <span className="post-job-input-icon">
                  <IndianRupee size={17} />
                  <input
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                  />
                </span>
              </label>

              <label>
                Application Deadline *
                <span className="post-job-input-icon">
                  <CalendarDays size={17} />
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    min={today || undefined}
                    required
                  />
                </span>
              </label>
            </div>
          </section>

          <section className="post-job-section">
            <h2>Job Description</h2>

            <label>
              About the Role *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </label>

            <label>
              Key Responsibilities *
              <textarea
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                rows={4}
                required
              />
            </label>
          </section>

          <section className="post-job-section">
            <h2>Eligibility &amp; Skills</h2>

            <label>
              Eligibility Requirements *
              <textarea
                name="eligibility"
                value={form.eligibility}
                onChange={handleChange}
                rows={3}
                required
              />
            </label>

            <label>
              Required Skills *
              <textarea
                name="skills"
                value={form.skills}
                onChange={handleChange}
                rows={3}
                required
              />
            </label>
          </section>

          <section className="post-job-section">
            <h2>Publishing</h2>

            <label>
              Job Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active — visible to students</option>
                <option value="Draft">Draft — not published</option>
                <option value="Closed">Closed — applications stopped</option>
              </select>
            </label>
          </section>

          {message && (
            <div
              className="post-job-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <div className="post-job-actions">
            <button
              type="button"
              className="post-job-cancel"
              onClick={() => router.push("/recruiter")}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="post-job-submit"
              disabled={isSubmitting}
            >
              <Save size={18} />
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

          <p className="post-job-demo-note">
            Changes are saved to the Campus Connect database.
          </p>
        </form>
      </div>
    </div>
  );
}
