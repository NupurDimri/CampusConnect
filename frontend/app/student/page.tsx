"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
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
  AlertCircle,
} from "lucide-react";

type Application = {
  id: string;
  job_id: string;
  student_email: string;
  application_status: string;
  applied_at: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  work_mode: string;
  salary?: string;
};

type StudentProfileResponse = {
  profilePictureUrl?: string | null;
  error?: string;
  message?: string;
};

const statusStyles: Record<string, string> = {
  Applied: "status-applied",
  "Under Review": "status-review",
  Shortlisted: "status-shortlisted",
  Rejected: "status-rejected",
  Selected: "status-shortlisted",
  "Interview Scheduled": "status-review",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeStatus(status: string) {
  return status
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function StudentDashboard() {
  const { currentUser, isLoading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Profile picture state
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  // Load the student's profile picture.
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setProfilePictureUrl("");
      return;
    }

    let cancelled = false;

    async function loadProfilePicture() {
      try {
        const response = await fetch("/api/student/profile", {
          method: "GET",
          cache: "no-store",
        });

        const data: StudentProfileResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load the student profile."
          );
        }

        if (!cancelled) {
          setProfilePictureUrl(data.profilePictureUrl || "");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Profile picture loading error:", err);
          setProfilePictureUrl("");
        }
      }
    }

    void loadProfilePicture();

    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading]);

  // Load the student's applications.
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setApplications([]);
      setLoading(false);
      setError("");
      return;
    }

    const studentEmail = currentUser.email;
    let cancelled = false;

    async function fetchApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/applications?studentEmail=${encodeURIComponent(studentEmail)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Unable to load your applications."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected response.");
        }

        if (!cancelled) {
          setApplications(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading applications."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchApplications();

    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading]);

  const totalApplications = applications.length;

  const underReview = applications.filter(
    (application) =>
      normalizeStatus(application.application_status) === "Under Review"
  ).length;

  const shortlisted = applications.filter(
    (application) =>
      normalizeStatus(application.application_status) === "Shortlisted"
  ).length;

  const upcomingInterviews = applications.filter(
    (application) =>
      normalizeStatus(application.application_status) ===
      "Interview Scheduled"
  ).length;

  const firstName =
    currentUser?.fullName?.trim().split(/\s+/)[0] || "Student";

  return (
    <div className="student-dashboard">
      <div className="student-dashboard-layout">
        <aside className="student-sidebar">
          <div className="student-profile">
            <div className="student-avatar">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={`${currentUser?.fullName || "Student"} profile picture`}
                  className="student-avatar-image"
                />
              ) : (
                currentUser?.fullName?.charAt(0).toUpperCase() || "S"
              )}
            </div>

            <div>
              <strong>{currentUser?.fullName || "Student"}</strong>
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
              <UserRound size={18} />
              My Profile
            </Link>

            <Link href="/student/application" className="student-nav-link">
              <FileText size={18} />
              My Applications
            </Link>
          </nav>

          <div className="student-sidebar-help">
            <div className="student-help-icon">
              <BriefcaseBusiness size={21} />
            </div>

            <strong>Your next opportunity awaits.</strong>

            <p>
              Explore new roles and take the next step in your career.
            </p>

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

              <h2>Welcome back, {firstName}!</h2>

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

          {/* Dashboard statistics */}
          <div className="student-stats-grid">
            <div className="student-stat-card">
              <div className="student-stat-icon green">
                <FileText size={21} />
              </div>

              <span>Total Applications</span>
              <strong>{loading ? "—" : totalApplications}</strong>
              <small>Applications submitted</small>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon orange">
                <Clock3 size={21} />
              </div>

              <span>Under Review</span>
              <strong>{loading ? "—" : underReview}</strong>
              <small>Awaiting a decision</small>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon blue">
                <CheckCircle2 size={21} />
              </div>

              <span>Shortlisted</span>
              <strong>{loading ? "—" : shortlisted}</strong>
              <small>Moving to the next stage</small>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon purple">
                <CalendarDays size={21} />
              </div>

              <span>Upcoming Interviews</span>
              <strong>{loading ? "—" : upcomingInterviews}</strong>
              <small>Applications marked for interview</small>
            </div>
          </div>

          {/* Recent applications */}
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

              {authLoading || loading ? (
                <div className="px-5 py-10 text-center text-gray-500">
                  Loading your applications...
                </div>
              ) : error ? (
                <div className="m-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <strong>Unable to load applications</strong>
                    <p className="mt-1">{error}</p>

                    <button
                      type="button"
                      className="mt-3 font-semibold underline"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : applications.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f8f7f4] text-[#173d2a]">
                    <BriefcaseBusiness size={26} />
                  </div>

                  <h4 className="text-lg font-semibold text-[#173d2a]">
                    No applications yet
                  </h4>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    You haven&apos;t applied for any jobs yet. Explore available
                    opportunities and submit your first application.
                  </p>

                  <Link
                    href="/jobs"
                    className="student-primary-button mt-5 inline-flex"
                  >
                    Find jobs <ArrowRight size={17} />
                  </Link>
                </div>
              ) : (
                <div className="student-application-list">
                  {applications.slice(0, 5).map((application) => {
                    const status = normalizeStatus(
                      application.application_status
                    );

                    return (
                      <div
                        className="student-application"
                        key={application.id}
                      >
                        <div className="student-company-icon">
                          <BriefcaseBusiness size={20} />
                        </div>

                        <div className="student-application-info">
                          <Link
                            href={`/jobs/${application.job_id}`}
                            className="font-semibold text-[#173d2a] hover:text-[#d77a5d]"
                          >
                            {application.title}
                          </Link>

                          <span>{application.company}</span>

                          <small>
                            Applied on {formatDate(application.applied_at)}
                          </small>
                        </div>

                        <span
                          className={`student-status ${
                            statusStyles[status] || "status-applied"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="student-panel-footer">
                <span>
                  {loading
                    ? "Loading applications..."
                    : `Showing ${Math.min(applications.length, 5)} of ${
                        applications.length
                      } applications`}
                </span>

                <Link href="/student/application">
                  View all applications
                </Link>
              </div>
            </section>

            {/* Profile overview */}
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
                <li>
                  <CheckCircle2 size={17} />
                  Basic information
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  Education details
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  Skills and interests
                </li>

                <li className="incomplete">
                  <Clock3 size={17} />
                  Resume upload
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