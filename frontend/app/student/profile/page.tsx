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
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/profile", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your profile.");
      }

      const apiProfile = data.profile as ApiProfile;

      if (!apiProfile) {
        throw new Error("The server did not return your profile.");
      }

      const loadedProfile: Profile = {
        fullName: String(apiProfile.fullName ?? ""),
        email: String(apiProfile.email ?? ""),
        phone: String(apiProfile.phone ?? ""),
        location: String(apiProfile.location ?? ""),
        college: String(apiProfile.college ?? ""),
        degree: String(apiProfile.degree ?? ""),
        branch: String(apiProfile.branch ?? ""),
        graduationYear: String(apiProfile.graduationYear ?? ""),
        cgpa: String(apiProfile.cgpa ?? ""),
        skills: String(apiProfile.skills ?? ""),
        interests: String(apiProfile.interests ?? ""),
      };

      setProfile(loadedProfile);
      setOriginalProfile(loadedProfile);
      setResumeName(apiProfile.resumeName ?? "");
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

    if (
      profile.cgpa.trim() !== "" &&
      (!Number.isFinite(Number(profile.cgpa)) ||
        Number(profile.cgpa) < 0 ||
        Number(profile.cgpa) > 10)
    ) {
      setError("CGPA must be between 0 and 10.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your profile.");
      }

      const apiProfile = data.profile as ApiProfile;

      const updatedProfile: Profile = {
        fullName: String(apiProfile.fullName ?? ""),
        email: String(apiProfile.email ?? ""),
        phone: String(apiProfile.phone ?? ""),
        location: String(apiProfile.location ?? ""),
        college: String(apiProfile.college ?? ""),
        degree: String(apiProfile.degree ?? ""),
        branch: String(apiProfile.branch ?? ""),
        graduationYear: String(apiProfile.graduationYear ?? ""),
        cgpa: String(apiProfile.cgpa ?? ""),
        skills: String(apiProfile.skills ?? ""),
        interests: String(apiProfile.interests ?? ""),
      };

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setResumeName(apiProfile.resumeName ?? "");
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

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p className="py-12 text-center text-gray-500">
            Loading your profile...
          </p>
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
              disabled={saving}
              onClick={handleSave}
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
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => void loadProfile()}
              >
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
                  />
                </label>

                <label className="profile-field">
                  Email Address *
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
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
                  <h2>Skills &amp; Interests</h2>
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
                <p className="profile-resume-error">{resumeError}</p>
              )}

              {resumeName && (
                <p className="profile-field-hint">
                  Resume selection is currently local only; the file has not
                  been uploaded to the server.
                </p>
              )}
            </section>

            <div className="profile-bottom-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={editing ? handleCancel : () => history.back()}
                disabled={saving}
              >
                {editing ? "Cancel Changes" : "Back"}
              </button>

              {editing && (
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
          </div>
        </div>
      </div>
    </div>
  );
}
