
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ArrowUpRight,
  Building2,
  BriefcaseBusiness,
  Users,
  X,
} from "lucide-react";

const companies = [
  {
    id: "1",
    name: "TechNova",
    industry: "Information Technology",
    location: "Bengaluru, India",
    size: "201–500 employees",
    description:
      "A technology company focused on software engineering, digital products, and scalable business solutions.",
    openings: 2,
    initials: "TN",
    jobs: ["Software Development Engineer", "Junior Java Developer"],
  },
  {
    id: "2",
    name: "PixelCraft",
    industry: "Web Development",
    location: "Remote",
    size: "51–200 employees",
    description:
      "A digital studio building modern web experiences with an emphasis on usability and responsive design.",
    openings: 1,
    initials: "PC",
    jobs: ["Frontend Developer Intern"],
  },
  {
    id: "3",
    name: "InsightWorks",
    industry: "Data & Analytics",
    location: "Gurugram, India",
    size: "101–200 employees",
    description:
      "A data-focused organization helping teams understand business performance through analytics and reporting.",
    openings: 1,
    initials: "IW",
    jobs: ["Data Analyst"],
  },
  {
    id: "4",
    name: "CodeBridge",
    industry: "Software Development",
    location: "Noida, India",
    size: "51–200 employees",
    description:
      "A software development company offering opportunities to learn programming and contribute to real projects.",
    openings: 1,
    initials: "CB",
    jobs: ["Python Developer Intern"],
  },
  {
    id: "5",
    name: "DesignNest",
    industry: "Design & Creative",
    location: "Remote",
    size: "11–50 employees",
    description:
      "A creative team working on digital interfaces, product design, and user-centered experiences.",
    openings: 1,
    initials: "DN",
    jobs: ["UI/UX Design Intern"],
  },
  {
    id: "6",
    name: "CloudAxis",
    industry: "Cloud & Enterprise Software",
    location: "Pune, India",
    size: "201–500 employees",
    description:
      "A software company working on business applications and cloud-oriented technology solutions.",
    openings: 1,
    initials: "CA",
    jobs: ["Junior Java Developer"],
  },
];

const industries = [
  "All Industries",
  "Information Technology",
  "Web Development",
  "Data & Analytics",
  "Software Development",
  "Design & Creative",
  "Cloud & Enterprise Software",
];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [selectedCompany, setSelectedCompany] = useState<
    (typeof companies)[number] | null
  >(null);

  const filteredCompanies = useMemo(() => {
    const query = search.toLowerCase().trim();

    return companies.filter((company) => {
      const matchesSearch =
        !query ||
        company.name.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.location.toLowerCase().includes(query);

      const matchesIndustry =
        industry === "All Industries" || company.industry === industry;

      return matchesSearch && matchesIndustry;
    });
  }, [search, industry]);

  return (
    <div className="companies-page">
      <section className="companies-hero">
        <div className="container">
          <span className="section-kicker">MEET THE EMPLOYERS</span>
          <h1>Discover companies. Find your direction.</h1>
          <p>
            Explore employers, learn about their work, and discover opportunities
            that match your career goals.
          </p>

          <div className="companies-search">
            <Search size={20} />
            <input
              type="search"
              placeholder="Search companies, industries, or locations"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear company search"
                onClick={() => setSearch("")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="companies-content">
        <div className="container">
          <div className="companies-heading">
            <div>
              <span className="section-kicker">COMPANY DIRECTORY</span>
              <h2>Explore employers</h2>
              <p>
                {filteredCompanies.length}{" "}
                {filteredCompanies.length === 1 ? "company" : "companies"} found
              </p>
            </div>

            <label className="industry-filter">
              <span>Industry</span>
              <select
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
              >
                {industries.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          {filteredCompanies.length > 0 ? (
            <div className="companies-grid">
              {filteredCompanies.map((company) => (
                <article className="company-card" key={company.id}>
                  <div className="company-card-top">
                    <div className="company-logo">
                      {company.initials}
                    </div>
                    <span className="company-opening-badge">
                      {company.openings}{" "}
                      {company.openings === 1 ? "opening" : "openings"}
                    </span>
                  </div>

                  <p className="company-industry">{company.industry}</p>
                  <h3>{company.name}</h3>
                  <p className="company-description">{company.description}</p>

                  <div className="company-meta">
                    <span>
                      <MapPin size={15} />
                      {company.location}
                    </span>
                    <span>
                      <Users size={15} />
                      {company.size}
                    </span>
                  </div>

                  <div className="company-card-actions">
                    <button
                      type="button"
                      className="company-profile-button"
                      onClick={() => setSelectedCompany(company)}
                    >
                      View company <ArrowUpRight size={16} />
                    </button>

                    <Link
                      href="/jobs"
                      className="company-jobs-button"
                      aria-label={`Browse jobs at ${company.name}`}
                    >
                      <BriefcaseBusiness size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="companies-empty">
              <Building2 size={35} />
              <h3>No companies found</h3>
              <p>Try a different search term or select another industry.</p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setSearch("");
                  setIndustry("All Industries");
                }}
              >
                Show all companies
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedCompany && (
        <div
          className="company-modal-backdrop"
          onClick={() => setSelectedCompany(null)}
        >
          <section
            className="company-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="company-modal-close"
              aria-label="Close company details"
              onClick={() => setSelectedCompany(null)}
            >
              <X size={20} />
            </button>

            <div className="company-logo company-modal-logo">
              {selectedCompany.initials}
            </div>

            <p className="company-industry">{selectedCompany.industry}</p>
            <h2 id="company-modal-title">{selectedCompany.name}</h2>
            <p className="company-modal-description">
              {selectedCompany.description}
            </p>

            <div className="company-modal-info">
              <span>
                <MapPin size={17} />
                {selectedCompany.location}
              </span>
              <span>
                <Users size={17} />
                {selectedCompany.size}
              </span>
              <span>
                <BriefcaseBusiness size={17} />
                {selectedCompany.openings} listed{" "}
                {selectedCompany.openings === 1 ? "opening" : "openings"}
              </span>
            </div>

            <h3>Listed opportunities</h3>
            <ul className="company-job-list">
              {selectedCompany.jobs.map((job) => (
                <li key={job}>{job}</li>
              ))}
            </ul>

            <Link
              href="/jobs"
              className="button button-primary company-modal-cta"
            >
              Browse job listings <ArrowUpRight size={17} />
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
