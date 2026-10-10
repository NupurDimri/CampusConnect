
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  GraduationCap,
  MapPin,
  Pencil,
  Save,
  Upload,
  UserRound,
} from "lucide-react";

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  college: string;
  degree: string;
  branch: string;
  graduationYear: string;
  cgpa: string;
  skills: string;
  interests: string;
};

const initialProfile: Profile = {
  fullName: "Student Name",
  email: "student@example.com",
  phone: "",
  location: "",
  college: "",
  degree: "B.Tech",
  branch: "",
  graduationYear: "2027",
  cgpa: "",
  skills: "",
  interests: "",
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [resumeError, setResumeError] = useState("");
  const resumeInput = useRef<HTMLInputElement>(null);

  function updateField(field: keyof Profile, value: string) {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    if (!profile.fullName.trim() || !profile.email.trim()) {
      alert("Please enter your name and email address.");
      return;
    }

    setEditing(false);
    setSaved(true);
  }

  function handleResume(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setResumeError("Please select a PDF or Word document.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Your resume must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setResumeName(file.name);
    setResumeError("");
    setSaved(false);
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Link href="/student" className="profile-back-link">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="profile-page-heading">
          <div>
            <span className="profile-eyebrow">STUDENT WORKSPACE</span>
            <h1>My Profile</h1>
            <p>
              Manage your personal details, academic background, and career
              information.
            </p>
          </div>

          {!editing ? (
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => {
                setEditing(true);
                setSaved(false);
              }}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <button
              type="button"
              className="profile-edit-button"
              onClick={handleSave}
            >
              <Save size={17} />
              Save Changes
            </button>
          )}
        </div>

        {saved && (
          <div className="profile-success-message" role="status">
            <CheckCircle2 size={19} />
            Your changes are saved for this session. They are not stored in a
            database yet.
          </div>
        )}

        <div className="profile-layout">
          <aside className="profile-summary-card">
            <div className="profile-avatar">
              <UserRound size={43} />
              {editing && (
                <span className="profile-avatar-edit">
                  <Camera size={15} />
                </span>
              )}
            </div>

            <h2>{profile.fullName || "Your Name"}</h2>
            <p>{profile.branch || "Add your course or branch"}</p>

            <div className="profile-summary-divider" />

            <div className="profile-summary-item">
              <GraduationCap size={18} />
              <span>{profile.college || "College not added"}</span>
            </div>

            <div className="profile-summary-item">
              <MapPin size={18} />
              <span>{profile.location || "Location not added"}</span>
            </div>

            <div className="profile-summary-item">
              <FileText size={18} />
              <span>{resumeName || "No resume selected"}</span>
            </div>

            <div className="profile-summary-note">
              <strong>Build your career profile</strong>
              <p>
                Add your education, skills, and resume to prepare for placement
                opportunities.
              </p>
            </div>
          </aside>

          <div className="profile-details">
            <section className="profile-section">
              <div className="profile-section-heading">
                <div className="profile-section-icon">
                  <UserRound size={20} />
                </div>
                <div>
                  <h2>Personal Information</h2>
                  <p>Your basic contact details</p>
                </div>
              </div>

              <div className="profile-fields-grid">
                <label className="profile-field">
                  Full Name *
                  <input
                    value={profile.fullName}
                    disabled={!editing}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </label>

                <label className="profile-field">
                  Email Address *
                  <input
                    type="email"
                    value={profile.email}
                    disabled={!editing}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>

                <label className="profile-field">
                  Phone Number
                  <input
                    type="tel"
                    value={profile.phone}
                    disabled={!editing}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </label>

                <label className="profile-field">
                  Location
                  <input
                    value={profile.location}
                    disabled={!editing}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="City, State"
                  />
                </label>
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <div className="profile-section-icon">
                  <GraduationCap size={21} />
                </div>
                <div>
                  <h2>Academic Information</h2>
                  <p>Your education and academic background</p>
                </div>
              </div>

              <div className="profile-fields-grid">
                <label className="profile-field profile-field-full">
                  College / University
                  <input
                    value={profile.college}
                    disabled={!editing}
                    onChange={(e) => updateField("college", e.target.value)}
                    placeholder="Enter your college name"
                  />
                </label>

                <label className="profile-field">
                  Degree
                  <select
                    value={profile.degree}
                    disabled={!editing}
                    onChange={(e) => updateField("degree", e.target.value)}
                  >
                    <option>B.Tech</option>
                    <option>B.E.</option>
                    <option>BCA</option>
                    <option>MCA</option>
                    <option>M.Tech</option>
                    <option>B.Sc.</option>
                    <option>M.Sc.</option>
                    <option>BBA</option>
                    <option>MBA</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="profile-field">
                  Branch / Specialization
                  <input
                    value={profile.branch}
                    disabled={!editing}
                    onChange={(e) => updateField("branch", e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </label>

                <label className="profile-field">
                  Graduation Year
                  <select
                    value={profile.graduationYear}
                    disabled={!editing}
                    onChange={(e) =>
                      updateField("graduationYear", e.target.value)
                    }
                  >
                    {Array.from({ length: 8 }, (_, i) => 2024 + i).map(
                      (year) => (
                        <option key={year} value={String(year)}>
                          {year}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="profile-field">
                  CGPA
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={profile.cgpa}
                    disabled={!editing}
                    onChange={(e) => updateField("cgpa", e.target.value)}
                    placeholder="e.g. 8.25"
                  />
                </label>
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <div className="profile-section-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h2>Skills & Interests</h2>
                  <p>Help recruiters understand your strengths</p>
                </div>
              </div>

              <div className="profile-fields-grid">
                <label className="profile-field profile-field-full">
                  Technical Skills
                  <textarea
                    rows={3}
                    value={profile.skills}
                    disabled={!editing}
                    onChange={(e) => updateField("skills", e.target.value)}
                    placeholder="e.g. Python, Java, React, SQL"
                  />
                  <span className="profile-field-hint">
                    Separate skills with commas.
                  </span>
                </label>

                <label className="profile-field profile-field-full">
                  Career Interests
                  <textarea
                    rows={3}
                    value={profile.interests}
                    disabled={!editing}
                    onChange={(e) => updateField("interests", e.target.value)}
                    placeholder="e.g. Web Development, Data Science, Software Engineering"
                  />
                </label>
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <div className="profile-section-icon">
                  <FileText size={20} />
                </div>
                <div>
                  <h2>Resume</h2>
                  <p>Choose a resume to associate with your profile</p>
                </div>
              </div>

              <div className="profile-resume-box">
                <div className="profile-resume-icon">
                  <FileText size={27} />
                </div>

                <div className="profile-resume-info">
                  <strong>{resumeName || "Upload your resume"}</strong>
                  <span>PDF or Word document · Maximum 5 MB</span>
                </div>

                <input
                  ref={resumeInput}
                  className="profile-resume-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResume}
                  disabled={!editing}
                  aria-label="Choose resume file"
                />

                <button
                  type="button"
                  className="profile-upload-button"
                  disabled={!editing}
                  onClick={() => resumeInput.current?.click()}
                >
                  <Upload size={16} />
                  Choose File
                </button>
              </div>

              {resumeError && (
                <p className="profile-resume-error">{resumeError}</p>
              )}

              {resumeName && (
                <p className="profile-field-hint">
                  File selected in this browser session. It has not been
                  uploaded to a server.
                </p>
              )}
            </section>

            <div className="profile-bottom-actions">
              <Link href="/student" className="profile-cancel-button">
                Back to Dashboard
              </Link>

              {editing && (
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleSave}
                >
                  <Save size={17} />
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
