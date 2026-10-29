"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type ApiProfile = Profile & {
  resumeName?: string;
  resumeUrl?: string;
  profilePictureUrl?: string;
};

const emptyProfile: Profile = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  college: "",
  degree: "",
  branch: "",
  graduationYear: "",
  cgpa: "",
  skills: "",
  interests: "",
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [originalProfile, setOriginalProfile] =
    useState<Profile>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeError, setResumeError] = useState("");
  const resumeInput = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your profile.");
      }

      const loaded: ApiProfile = data.profile;

      const nextProfile: Profile = {
        fullName: loaded.fullName ?? "",
        email: loaded.email ?? "",
        phone: loaded.phone ?? "",
        location: loaded.location ?? "",
        college: loaded.college ?? "",
        degree: loaded.degree ?? "",
        branch: loaded.branch ?? "",
        graduationYear: loaded.graduationYear ?? "",
        cgpa: loaded.cgpa ?? "",
        skills: loaded.skills ?? "",
        interests: loaded.interests ?? "",
      };

      setProfile(nextProfile);
      setOriginalProfile(nextProfile);
      setResumeName(loaded.resumeName ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function updateField(field: keyof Profile, value: string) {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setSaved(false);
    setError("");
  }

  async function handleSave() {
    if (!profile.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (profile.cgpa.trim() !== "") {
      const cgpa = Number(profile.cgpa);

      if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
        setError("CGPA must be between 0 and 10.");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          location: profile.location,
          college: profile.college,
          degree: profile.degree,
          branch: profile.branch,
          graduationYear: profile.graduationYear,
          cgpa: profile.cgpa,
          skills: profile.skills,
          interests: profile.interests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your profile.");
      }

      const updated: ApiProfile = data.profile;

      const nextProfile: Profile = {
        fullName: updated.fullName ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        location: updated.location ?? "",
        college: updated.college ?? "",
        degree: updated.degree ?? "",
        branch: updated.branch ?? "",
        graduationYear: updated.graduationYear ?? "",
        cgpa: updated.cgpa ?? "",
        skills: updated.skills ?? "",
        interests: updated.interests ?? "",
      };

      setProfile(nextProfile);
      setOriginalProfile(nextProfile);
      setResumeName(updated.resumeName ?? "");
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setProfile(originalProfile);
    setEditing(false);
    setSaved(false);
    setError("");
    setResumeError("");

    if (resumeInput.current) {
      resumeInput.current.value = "";
    }
  }

  function handleResume(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = /\.(pdf|doc|docx)$/i;

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.test(file.name)
    ) {
      setResumeError("Please select a PDF or Word document.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Your resume must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setResumeError("");
    setSaved(false);
    setResumeName(file.name);
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p role="status">Loading your profile...</p>
        </div>
      </div>
    );
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
                setError("");
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
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {error && (
          <div className="profile-resume-error" role="alert">
            {error}
            {!editing && (
              <button type="button" onClick={() => void loadProfile()}>
                Try again
              </button>
            )}
          </div>
        )}

        {saved && (
          <div className="profile-success-message" role="status">
            <CheckCircle2 size={19} />
            Your profile has been saved to the database successfully.
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
              <span>{resumeName || "No resume uploaded"}</span>
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
                    disabled={!editing || saving}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={150}
                    required
                  />
                </label>

                <label className="profile-field">
                  Email Address
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                  <span className="profile-field-hint">
                    Email changes are managed separately from your profile.
                  </span>
                </label>

                <label className="profile-field">
                  Phone Number
                  <input
                    type="tel"
                    value={profile.phone}
                    disabled={!editing || saving}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </label>

                <label className="profile-field">
                  Location
                  <input
                    value={profile.location}
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
                    onChange={(e) => updateField("college", e.target.value)}
                    placeholder="Enter your college name"
                  />
                </label>

                <label className="profile-field">
                  Degree
                  <select
                    value={profile.degree}
                    disabled={!editing || saving}
                    onChange={(e) => updateField("degree", e.target.value)}
                  >
                    <option value="">Select degree</option>
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
                    disabled={!editing || saving}
                    onChange={(e) => updateField("branch", e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </label>

                <label className="profile-field">
                  Graduation Year
                  <select
                    value={profile.graduationYear}
                    disabled={!editing || saving}
                    onChange={(e) =>
                      updateField("graduationYear", e.target.value)
                    }
                  >
                    <option value="">Select year</option>
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
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
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
                  disabled={!editing || saving}
                  aria-label="Choose resume file"
                />

                <button
                  type="button"
                  className="profile-upload-button"
                  disabled={!editing || saving}
                  onClick={() => resumeInput.current?.click()}
                >
                  <Upload size={16} />
                  Choose File
                </button>
              </div>

              {resumeError && (
                <p className="profile-resume-error" role="alert">
                  {resumeError}
                </p>
              )}

              {resumeName && (
                <p className="profile-field-hint">
                  Resume upload will be connected in the next step. Selecting a
                  file here does not upload it or save it to the database.
                </p>
              )}
            </section>

            <div className="profile-bottom-actions">
              <Link href="/student" className="profile-cancel-button">
                Back to Dashboard
              </Link>

              {editing && (
                <>
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="profile-edit-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}