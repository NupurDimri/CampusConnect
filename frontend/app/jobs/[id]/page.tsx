
"use client";

import { useState } from "react";
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

const jobData = [
  {
    id: "1",
    title: "Software Development Engineer",
    company: "TechNova",
    location: "Bengaluru, India",
    type: "Full-time",
    category: "Software Development",
    salary: "₹6–10 LPA",
    posted: "2 days ago",
    deadline: "30 November 2026",
    description:
      "We are looking for motivated graduates who enjoy solving problems and building reliable software. You will work with experienced developers to design, develop, test, and maintain applications.",
    responsibilities: [
      "Develop and maintain software applications.",
      "Write readable, reusable, and efficient code.",
      "Identify bugs and help troubleshoot technical issues.",
      "Collaborate with developers and other team members.",
    ],
    eligibility: [
      "Bachelor's degree in Computer Science, IT, or a related field.",
      "Basic understanding of programming and data structures.",
      "Good problem-solving and communication skills.",
      "Willingness to learn new technologies.",
    ],
    skills: ["Java", "Python", "Data Structures", "SQL", "Git"],
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
    deadline: "15 November 2026",
    description:
      "Join our frontend team to build engaging and responsive web experiences. This internship offers practical experience working with modern web technologies and real projects.",
    responsibilities: [
      "Build responsive user interfaces.",
      "Convert designs into reusable components.",
      "Test pages across different screen sizes.",
      "Work with developers to improve website usability.",
    ],
    eligibility: [
      "Currently pursuing or recently completed a relevant degree.",
      "Understanding of HTML, CSS, and JavaScript.",
      "Basic knowledge of React is preferred.",
      "Interest in learning frontend development.",
    ],
    skills: ["React", "Next.js", "JavaScript", "CSS", "Git"],
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
    deadline: "25 November 2026",
    description:
      "Help transform raw data into useful insights. You will work with datasets, prepare reports, and support business decisions through data analysis and visualization.",
    responsibilities: [
      "Collect, clean, and analyze datasets.",
      "Prepare reports and dashboards.",
      "Identify patterns and trends in data.",
      "Communicate findings to the wider team.",
    ],
    eligibility: [
      "Degree in Computer Science, Statistics, or a related field.",
      "Basic knowledge of Python and SQL.",
      "Understanding of data visualization concepts.",
      "Analytical thinking and attention to detail.",
    ],
    skills: ["Python", "SQL", "Excel", "Power BI", "Statistics"],
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
    deadline: "20 November 2026",
    description:
      "Work alongside our development team to create Python-based applications, learn development best practices, and contribute to ongoing software projects.",
    responsibilities: [
      "Write and test Python code.",
      "Help debug existing applications.",
      "Work with databases and APIs under guidance.",
      "Document development work.",
    ],
    eligibility: [
      "Currently pursuing a degree in a relevant field.",
      "Basic Python programming knowledge.",
      "Understanding of functions, loops, and data structures.",
      "Willingness to learn and collaborate.",
    ],
    skills: ["Python", "SQL", "OOP", "Git", "APIs"],
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
    deadline: "18 November 2026",
    description:
      "Help design intuitive digital experiences by creating wireframes, prototypes, and user-friendly interfaces for web and mobile applications.",
    responsibilities: [
      "Create wireframes and interface mockups.",
      "Assist with interactive prototypes.",
      "Research user needs and design patterns.",
      "Collaborate with product and development teams.",
    ],
    eligibility: [
      "Interest in UI/UX or product design.",
      "Basic familiarity with Figma or similar tools.",
      "Understanding of layout and visual hierarchy.",
      "A portfolio or sample projects is an advantage.",
    ],
    skills: ["Figma", "Wireframing", "Prototyping", "UI Design"],
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
    deadline: "28 November 2026",
    description:
      "Join our engineering team to develop and maintain Java applications, participate in code reviews, and learn from experienced software engineers.",
    responsibilities: [
      "Develop application features using Java.",
      "Write unit tests and troubleshoot bugs.",
      "Work with databases and APIs.",
      "Participate in team discussions and code reviews.",
    ],
    eligibility: [
      "Degree in Computer Science, IT, or a related field.",
      "Understanding of Java and object-oriented programming.",
      "Basic knowledge of SQL.",
      "Good logical reasoning and problem-solving skills.",
    ],
    skills: ["Java", "OOP", "SQL", "Spring Boot", "Git"],
  },
];

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const [applied, setApplied] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const job = jobData.find((item) => item.id === params.id);

  if (!job) {
    return (
      <section className="job-not-found">
        <div className="container">
          <BriefcaseBusiness size={42} />
          <h1>Job not found</h1>
          <p>This opportunity may not exist or may have been removed.</p>
          <Link href="/jobs" className="button button-primary">
            <ArrowLeft size={17} />
            Back to jobs
          </Link>
        </div>
      </section>
    );
  }

  function handleApply() {
    setApplied(true);
    setShowLoginMessage(false);
  }

  return (
    <div className="job-details-page">
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
              <span className="section-kicker">{job.category}</span>
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
                  {job.type}
                </span>
              </div>
            </div>
          </div>

          <div className="job-details-banner-bottom">
            <span className="job-details-salary">
              <IndianRupee size={19} />
              {job.salary}
            </span>
            <span className="job-posted">
              <Clock3 size={16} />
              Posted {job.posted}
            </span>
          </div>
        </div>
      </section>

      <section className="job-details-content">
        <div className="container job-details-layout">
          <div className="job-details-main">
            <article className="job-info-card">
              <h2>About this role</h2>
              <p className="job-info-description">{job.description}</p>

              <h3>Key responsibilities</h3>
              <ul className="job-detail-list">
                {job.responsibilities.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3>Eligibility requirements</h3>
              <ul className="job-detail-list">
                {job.eligibility.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3>Required skills</h3>
              <div className="job-detail-skills">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          </div>

          <aside className="job-details-sidebar">
            <div className="job-apply-card">
              <span className="section-kicker">APPLICATION</span>
              <h2>Interested in this role?</h2>
              <p>
                Review the requirements and apply when you are ready to take
                the next step.
              </p>

              <div className="job-deadline">
                <CalendarDays size={19} />
                <div>
                  <small>Application deadline</small>
                  <strong>{job.deadline}</strong>
                </div>
              </div>

              {applied ? (
                <div className="application-success" role="status">
                  <CheckCircle2 size={22} />
                  <div>
                    <strong>Application recorded!</strong>
                    <p>
                      This is a frontend demo. Your application has not been
                      saved to a database.
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

            <div className="job-company-card">
              <div className="job-company-card-icon">
                <GraduationCap size={25} />
              </div>
              <h3>{job.company}</h3>
              <p>
                Recruiter profile and additional company information will be
                available when company profiles are connected.
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
