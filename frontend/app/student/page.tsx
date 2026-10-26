
"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ArrowRight,
  Search,
  UserRound,
  Bell,
  TrendingUp,
} from "lucide-react";

const applications = [
  {
    id: 1,
    role: "Software Development Engineer",
    company: "TechNova",
    date: "Oct 08, 2026",
    status: "Under Review",
  },
  {
    id: 2,
    role: "Frontend Developer Intern",
    company: "PixelCraft",
    date: "Oct 06, 2026",
    status: "Shortlisted",
  },
  {
    id: 3,
    role: "Data Analyst",
    company: "InsightWorks",
    date: "Oct 03, 2026",
    status: "Applied",
  },
];

const statusStyles: Record<string, string> = {
  "Applied": "status-applied",
  "Under Review": "status-review",
  "Shortlisted": "status-shortlisted",
};

export default function StudentDashboard() {
  return (
    <div className="student-dashboard">
      <div className="student-dashboard-layout">
        <aside className="student-sidebar">
          <div className="student-profile">
            <div className="student-avatar">S</div>
            <div>
              <strong>Student Name</strong>
              <span>Student Account</span>
            </div>
          </div>

          <p className="sidebar-label">WORKSPACE</p>

          <nav className="student-nav">
            <Link href="/student" className="student-nav-link active">
              <TrendingUp size={18} />
              Dashboard
            </Link>
            <Link href="/jobs" className="student-nav-link">
              <Search size={18} />
              Find Jobs
            </Link>
            <Link href="/companies" className="student-nav-link">
              <BriefcaseBusiness size={18} />
              Companies
            </Link>
            
            <Link href="/student/profile" className="student-nav-link">
              <UserRound size={18} />My Profile
            </Link>
            
            <Link href="/student/applications" className="student-nav-link">
              <FileText size={18} />My Applications
            </Link>

          </nav>

          <div className="student-sidebar-help">
            <div className="student-help-icon">
              <BriefcaseBusiness size={21} />
            </div>
            <strong>Your next opportunity awaits.</strong>
            <p>Explore new roles and take the next step in your career.</p>
            <Link href="/jobs">
              Explore jobs <ArrowRight size={15} />
            </Link>
          </div>
        </aside>

        <section className="student-dashboard-main">
          <div className="student-dashboard-topbar">
            <div>
              <span className="student-eyebrow">STUDENT WORKSPACE</span>
              <h1>Dashboard</h1>
            </div>
            <button
              type="button"
              className="student-notification"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
              <span />
            </button>
          </div>

          <div className="student-welcome">
            <div>
              <span>YOUR CAREER JOURNEY</span>
              <h2>Welcome back, Student!</h2>
              <p>
                Keep track of your applications and discover your next
                opportunity.
              </p>
              <Link href="/jobs" className="student-primary-button">
                Find opportunities <ArrowRight size={17} />
              </Link>
            </div>
            <div className="student-welcome-art">
              <BriefcaseBusiness size={74} strokeWidth={1.2} />
            </div>
          </div>

          <div className="student-stats-grid">
            <div className="student-stat-card">
              <div className="student-stat-icon green">
                <FileText size={21} />
              </div>
              <span>Total Applications</span>
              <strong>12</strong>
              <small>Applications submitted</small>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon orange">
                <Clock3 size={21} />
              </div>
              <span>Under Review</span>
              <strong>4</strong>
              <small>Awaiting a decision</small>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon blue">
                <CheckCircle2 size={21} />
              </div>
              <span>Shortlisted</span>
              <strong>3</strong>
              <small>Moving to the next stage</small>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon purple">
                <CalendarDays size={21} />
              </div>
              <span>Upcoming Interviews</span>
              <strong>2</strong>
              <small>Check your interview schedule</small>
            </div>
          </div>

          <div className="student-content-grid">
            <section className="student-panel">
              <div className="student-panel-heading">
                <div>
                  <h3>Recent Applications</h3>
                  <p>Keep an eye on your application progress.</p>
                </div>
                <Link href="/jobs">
                  Explore jobs <ArrowRight size={15} />
                </Link>
              </div>

              <div className="student-application-list">
                {applications.map((application) => (
                  <div className="student-application" key={application.id}>
                    <div className="student-company-icon">
                      <BriefcaseBusiness size={20} />
                    </div>
                    <div className="student-application-info">
                      <strong>{application.role}</strong>
                      <span>{application.company}</span>
                      <small>Applied on {application.date}</small>
                    </div>
                    <span
                      className={`student-status ${
                        statusStyles[application.status]
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="student-panel-footer">
                <span>Showing 3 sample applications</span>
                <Link href="/jobs">Browse more jobs</Link>
              </div>
            </section>

            <aside className="student-panel student-profile-panel">
              <div className="student-panel-heading">
                <div>
                  <h3>Profile Overview</h3>
                  <p>Make your profile recruiter-ready.</p>
                </div>
              </div>

              <div className="student-profile-progress">
                <div className="student-progress-ring">
                  <strong>70%</strong>
                </div>
                <div>
                  <strong>Good progress!</strong>
                  <p>Complete your profile to stand out.</p>
                </div>
              </div>

              <div className="student-progress-track">
                <div />
              </div>

              <ul className="student-profile-checklist">
                <li><CheckCircle2 size={17} /> Basic information</li>
                <li><CheckCircle2 size={17} /> Education details</li>
                <li><CheckCircle2 size={17} /> Skills and interests</li>
                <li className="incomplete">
                  <Clock3 size={17} /> Resume upload
                </li>
              </ul>

              <Link
                href="/student/profile"
                className="student-outline-button"
              >
                Complete profile <ArrowRight size={16} />
              </Link>
            </aside>
          </div>

          <div className="student-dashboard-note">
            <Bell size={18} />
            <div>
              <strong>Stay ready for your next opportunity</strong>
              <p>
                Check job deadlines regularly and keep your profile updated.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
