
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";

const jobs = [
  {
    id: "1",
    title: "Software Development Engineer",
    company: "TechNova",
    location: "Bengaluru, India",
    type: "Full-time",
    category: "Software Development",
    salary: "₹6–10 LPA",
    posted: "2 days ago",
    description:
      "Work with a development team to build, test, and maintain scalable software applications.",
    skills: ["Java", "Python", "Data Structures"],
  },
  {
    id: "2",
    title: "Frontend Developer Intern",
    company: "PixelCraft",
    location: "Remote",
    type: "Internship",
    category: "Web Development",
    salary: "₹15,000/month",
    posted: "1 day ago",
    description:
      "Help create responsive web interfaces and improve the user experience of web applications.",
    skills: ["React", "Next.js", "CSS"],
  },
  {
    id: "3",
    title: "Data Analyst",
    company: "InsightWorks",
    location: "Gurugram, India",
    type: "Full-time",
    category: "Data Science",
    salary: "₹4–7 LPA",
    posted: "3 days ago",
    description:
      "Analyze datasets, prepare reports, and help teams make data-informed decisions.",
    skills: ["Python", "SQL", "Power BI"],
  },
  {
    id: "4",
    title: "Python Developer Intern",
    company: "CodeBridge",
    location: "Noida, India",
    type: "Internship",
    category: "Software Development",
    salary: "₹12,000/month",
    posted: "4 days ago",
    description:
      "Support backend development and write clean, maintainable Python code.",
    skills: ["Python", "SQL", "Git"],
  },
  {
    id: "5",
    title: "UI/UX Design Intern",
    company: "DesignNest",
    location: "Remote",
    type: "Internship",
    category: "Design",
    salary: "₹10,000/month",
    posted: "5 days ago",
    description:
      "Assist in designing accessible interfaces, wireframes, and interactive prototypes.",
    skills: ["Figma", "Wireframing", "Prototyping"],
  },
  {
    id: "6",
    title: "Junior Java Developer",
    company: "CloudAxis",
    location: "Pune, India",
    type: "Full-time",
    category: "Software Development",
    salary: "₹5–8 LPA",
    posted: "1 week ago",
    description:
      "Contribute to application development, testing, debugging, and code reviews.",
    skills: ["Java", "SQL", "OOP"],
  },
];

const categories = [
  "All Categories",
  "Software Development",
  "Web Development",
  "Data Science",
  "Design",
];

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("All Types");
  const [category, setCategory] = useState("All Categories");

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();
    const place = location.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.skills.some((skill) => skill.toLowerCase().includes(query));

      const matchesLocation =
        !place || job.location.toLowerCase().includes(place);

      const matchesType =
        jobType === "All Types" || job.type === jobType;

      const matchesCategory =
        category === "All Categories" || job.category === category;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesCategory
      );
    });
  }, [search, location, jobType, category]);

  return (
    <div className="jobs-page">
      <section className="jobs-hero">
        <div className="container">
          <span className="section-kicker">YOUR CAREER STARTS HERE</span>
          <h1>Find the opportunity that fits your future.</h1>
          <p>
            Explore internships and job opportunities designed to help you take
            the next step in your career.
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

      <section className="jobs-content" id="job-listings">
        <div className="container">
          <div className="jobs-results-heading">
            <div>
              <span className="section-kicker">EXPLORE OPPORTUNITIES</span>
              <h2>Available positions</h2>
              <p>
                Showing {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "opportunity" : "opportunities"}
              </p>
            </div>

            <div className="jobs-filter-label">
              <SlidersHorizontal size={17} />
              <span>Filter opportunities</span>
            </div>
          </div>

          <div className="jobs-filters">
            <label>
              <span>Job type</span>
              <select
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
              >
                <option>All Types</option>
                <option>Full-time</option>
                <option>Internship</option>
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
              onClick={() => {
                setSearch("");
                setLocation("");
                setJobType("All Types");
                setCategory("All Categories");
              }}
            >
              Clear filters
            </button>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="job-card-top">
                    <div className="job-company-icon">
                      <BriefcaseBusiness size={24} />
                    </div>
                    <span className="job-type-badge">{job.type}</span>
                  </div>

                  <p className="job-company">{job.company}</p>
                  <h3>{job.title}</h3>
                  <p className="job-description">{job.description}</p>

                  <div className="job-meta">
                    <span>
                      <MapPin size={15} />
                      {job.location}
                    </span>
                    <span>
                      <Clock3 size={15} />
                      {job.posted}
                    </span>
                  </div>

                  <div className="job-skills">
                    {job.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>

                  <div className="job-card-bottom">
                    <div>
                      <small>Compensation</small>
                      <strong>{job.salary}</strong>
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
              ))}
            </div>
          ) : (
            <div className="jobs-empty-state">
              <Search size={32} />
              <h3>No matching opportunities</h3>
              <p>
                Try another job title, location, or category, or clear your
                filters to see all available positions.
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setSearch("");
                  setLocation("");
                  setJobType("All Types");
                  setCategory("All Categories");
                }}
              >
                Show all jobs
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
