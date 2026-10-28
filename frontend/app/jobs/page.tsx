"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  ArrowUpRight,
  SlidersHorizontal,
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

function parseSkills(value: string | null): string[] {
  if (!value?.trim()) return [];

  return value
    .split(/[,;\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function formatPostedDate(date: string): string {
  const postedDate = new Date(date);

  if (Number.isNaN(postedDate.getTime())) {
    return "Recently posted";
  }

  const daysAgo = Math.max(
    0,
    Math.floor(
      (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "1 day ago";
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 14) return "1 week ago";
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;

  return postedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("All Types");
  const [category, setCategory] = useState("All Categories");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load jobs from the PostgreSQL-backed API.
  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/jobs");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load job opportunities."
          );
        }

        if (!cancelled) {
          // Only show active opportunities to students.
          const activeJobs: Job[] = (result.jobs || []).filter(
            (job: Job) => job.status === "Active"
          );

          setJobs(activeJobs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading jobs."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  // Build filter options from the jobs currently available.
  const jobTypes = useMemo(() => {
    return [
      "All Types",
      ...Array.from(new Set(jobs.map((job) => job.job_type).filter(Boolean))),
    ];
  }, [jobs]);

  const categories = useMemo(() => {
    const departments = jobs
      .map((job) => job.department?.trim())
      .filter((department): department is string => Boolean(department));

    return [
      "All Categories",
      ...Array.from(new Set(departments)),
    ];
  }, [jobs]);

  // Search and filter database records.
  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();
    const place = location.toLowerCase().trim();

    return jobs.filter((job) => {
      const skills = parseSkills(job.skills);

      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.department || "").toLowerCase().includes(query) ||
        skills.some((skill) => skill.toLowerCase().includes(query));

      const matchesLocation =
        !place ||
        job.location.toLowerCase().includes(place) ||
        job.work_mode.toLowerCase().includes(place);

      const matchesType =
        jobType === "All Types" || job.job_type === jobType;

      const matchesCategory =
        category === "All Categories" || job.department === category;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesCategory
      );
    });
  }, [jobs, search, location, jobType, category]);

  function clearFilters() {
    setSearch("");
    setLocation("");
    setJobType("All Types");
    setCategory("All Categories");
  }

  return (
    <div className="jobs-page">
      {/* Hero and search */}
      <section className="jobs-hero">
        <div className="container">
          <span className="section-kicker">
            YOUR CAREER STARTS HERE
          </span>

          <h1>Find the opportunity that fits your future.</h1>

          <p>
            Explore internships and job opportunities designed to help
            you take the next step in your career.
          </p>

          <div className="jobs-search-panel">
            <label className="jobs-search-field">
              <Search size={19} />

              <input
                type="text"
                placeholder="Job title, company, or skill"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="jobs-search-field">
              <MapPin size={19} />

              <input
                type="text"
                placeholder="City or Remote"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="button button-primary jobs-search-button"
              onClick={() =>
                document
                  .getElementById("job-listings")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Available jobs */}
      <section className="jobs-content" id="job-listings">
        <div className="container">
          <div className="jobs-results-heading">
            <div>
              <span className="section-kicker">
                EXPLORE OPPORTUNITIES
              </span>

              <h2>Available positions</h2>

              <p>
                {isLoading
                  ? "Loading opportunities..."
                  : `Showing ${filteredJobs.length} ${
                      filteredJobs.length === 1
                        ? "opportunity"
                        : "opportunities"
                    }`}
              </p>
            </div>

            <div className="jobs-filter-label">
              <SlidersHorizontal size={17} />
              <span>Filter opportunities</span>
            </div>
          </div>

          {/* Filters */}
          <div className="jobs-filters">
            <label>
              <span>Job type</span>

              <select
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
              >
                {jobTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Category</span>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="jobs-clear-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="jobs-empty-state">
              <Clock3 size={32} />
              <h3>Loading opportunities</h3>
              <p>
                Please wait while we retrieve the latest jobs.
              </p>
            </div>
          ) : error ? (
            /* API error state */
            <div className="jobs-empty-state" role="alert">
              <BriefcaseBusiness size={32} />
              <h3>Unable to load jobs</h3>
              <p>{error}</p>

              <button
                type="button"
                className="button button-primary"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : filteredJobs.length > 0 ? (
            /* Job cards */
            <div className="jobs-grid">
              {filteredJobs.map((job) => {
                const skills = parseSkills(job.skills);

                return (
                  <article className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <div className="job-company-icon">
                        <BriefcaseBusiness size={24} />
                      </div>

                      <span className="job-type-badge">
                        {job.job_type}
                      </span>
                    </div>

                    <p className="job-company">{job.company}</p>

                    <h3>{job.title}</h3>

                    <p className="job-description">
                      {job.description}
                    </p>

                    <div className="job-meta">
                      <span>
                        <MapPin size={15} />
                        {job.location}
                      </span>

                      <span>
                        <Clock3 size={15} />
                        {formatPostedDate(job.created_at)}
                      </span>
                    </div>

                    {skills.length > 0 && (
                      <div className="job-skills">
                        {skills.map((skill, index) => (
                          <span key={`${skill}-${index}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="job-card-bottom">
                      <div>
                        <small>Compensation</small>
                        <strong>
                          {job.salary || "Not disclosed"}
                        </strong>
                      </div>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="job-details-link"
                        aria-label={`View details for ${job.title}`}
                      >
                        View details <ArrowUpRight size={17} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="jobs-empty-state">
              <Search size={32} />

              <h3>
                {jobs.length === 0
                  ? "No active opportunities yet"
                  : "No matching opportunities"}
              </h3>

              <p>
                {jobs.length === 0
                  ? "New opportunities will appear here when recruiters publish active jobs."
                  : "Try another job title, location, or category, or clear your filters to see all available positions."}
              </p>

              {(search ||
                location ||
                jobType !== "All Types" ||
                category !== "All Categories") && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={clearFilters}
                >
                  Show all jobs
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}