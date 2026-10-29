"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  IndianRupee,
  MapPin,
  Save,
} from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [today, setToday] = useState("");

  const [form, setForm] = useState({
    title: "",
    company: "TechNova",
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
  });

  // Calculate today's date after the component mounts.
  // This avoids the unstable Date() prerender error.
  useEffect(() => {
    const now = new Date();

    const localDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    setToday(localDate);
  }, []);

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

    if (!today) {
      setMessage("Please wait a moment and try again.");
      return;
    }

    if (form.deadline && form.deadline < today) {
      setMessage("Please select today or a future application deadline.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save the job. Please try again."
        );
      }

      setMessage("Job saved successfully to PostgreSQL!");

      // Return to the dashboard after displaying the success message.
      window.setTimeout(() => {
        router.push("/recruiter");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("Error submitting job:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while saving the job."
      );
    } finally {
      setIsSubmitting(false);
    }
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
            <h1>Post a New Job</h1>
            <p>
              Share an opportunity with students and find the right candidates.
            </p>
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
                  placeholder="e.g. Software Development Engineer"
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
                    placeholder="Company name"
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
                  placeholder="e.g. Engineering"
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
                    placeholder="e.g. Dehradun, Uttarakhand"
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
                    placeholder="e.g. 6–8 LPA or ₹15,000/month"
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
                    onChange={(event) => {
                    handleChange(event);
                    setMessage("");
                  }}
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
                placeholder="Describe the role and what the selected candidate will do..."
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
                placeholder="List the main responsibilities..."
                rows={4}
                required
              />
            </label>
          </section>

          <section className="post-job-section">
            <h2>Eligibility & Skills</h2>

            <label>
              Eligibility Requirements *
              <textarea
                name="eligibility"
                value={form.eligibility}
                onChange={handleChange}
                placeholder="e.g. B.Tech/BCA/MCA students, graduation year, minimum CGPA..."
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
                placeholder="e.g. Python, SQL, React, communication skills"
                rows={3}
                required
              />
            </label>
          </section>

          <section className="post-job-section">
            <h2>Publishing</h2>

            <label>
              Initial Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active — visible to students</option>
                <option value="Draft">Draft — not yet published</option>
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
              {isSubmitting ? "Saving Job..." : "Publish Job"}
            </button>
          </div>

          <p className="post-job-demo-note">
            Job details are submitted to the Campus Connect database.
          </p>
        </form>
      </div>
    </div>
  );
}