"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Settings2,
  LoaderCircle,
  Save,
  Mail,
  CalendarDays,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type AdminProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string | null;
};

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load settings.");
        }

        setAdmin(data.admin);
        setFullName(data.admin.fullName || "");
        setEmail(data.admin.email || "");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setAdmin(data.admin);
      setFullName(data.admin.fullName || "");
      setEmail(data.admin.email || "");
      setMessage(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "platform", label: "Platform", icon: Settings2 },
  ];

  if (loading) {
    return (
      <div className="admin-settings-loading">
        <LoaderCircle size={28} className="admin-settings-spinner" />
        <p>Loading admin settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-heading">
        <div>
          <p className="admin-settings-eyebrow">ADMINISTRATION</p>
          <h1>Settings</h1>
          <p>Manage your account and platform preferences.</p>
        </div>

        <div className="admin-settings-heading-icon">
          <Settings2 size={25} />
        </div>
      </div>

      <div className="admin-settings-layout">
        <aside className="admin-settings-sidebar">
          <div className="admin-settings-account">
            <div className="admin-settings-avatar">
              {(fullName || "A").charAt(0).toUpperCase()}
            </div>

            <div className="admin-settings-account-info">
              <h3>{fullName || "Administrator"}</h3>
              <p>{email}</p>
              <span>Administrator</span>
            </div>
          </div>

          <nav className="admin-settings-nav" aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`admin-settings-nav-item ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage("");
                    setError("");
                  }}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="admin-settings-sidebar-note">
            <ShieldCheck size={19} />
            <div>
              <strong>Administrator access</strong>
              <p>Your settings are protected by role-based access checks.</p>
            </div>
          </div>
        </aside>

        <section className="admin-settings-content">
          {message && (
            <div className="admin-settings-alert success" role="status">
              <CheckCircle2 size={19} />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="admin-settings-alert error" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="admin-settings-card">
              <div className="admin-settings-card-heading">
                <div className="admin-settings-section-icon">
                  <UserRound size={21} />
                </div>
                <div>
                  <h2>Profile Information</h2>
                  <p>Update your administrator name and email address.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave}>
                <div className="admin-settings-form-grid">
                  <div className="admin-settings-field full-width">
                    <label htmlFor="adminFullName">Full name</label>
                    <div className="admin-settings-input-wrap">
                      <UserRound size={18} />
                      <input
                        id="adminFullName"
                        type="text"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Enter your full name"
                        minLength={2}
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-settings-field full-width">
                    <label htmlFor="adminEmail">Email address</label>
                    <div className="admin-settings-input-wrap">
                      <Mail size={18} />
                      <input
                        id="adminEmail"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email address"
                        maxLength={254}
                        required
                      />
                    </div>
                    <small>
                      This email is stored in your administrator account.
                    </small>
                  </div>

                  <div className="admin-settings-field full-width">
                    <label>Account role</label>
                    <div className="admin-settings-readonly">
                      <ShieldCheck size={18} />
                      <span>Administrator</span>
                      <span className="admin-settings-readonly-badge">
                        Protected
                      </span>
                    </div>
                  </div>

                  <div className="admin-settings-field full-width">
                    <label>Account created</label>
                    <div className="admin-settings-readonly">
                      <CalendarDays size={18} />
                      <span>
                        {admin?.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-settings-form-footer">
                  <p>Your changes will be saved to PostgreSQL.</p>

                  <button
                    type="submit"
                    className="admin-settings-save-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <LoaderCircle
                        size={18}
                        className="admin-settings-spinner"
                      />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="admin-settings-card">
              <div className="admin-settings-card-heading">
                <div className="admin-settings-section-icon">
                  <LockKeyhole size={21} />
                </div>
                <div>
                  <h2>Account Security</h2>
                  <p>Manage the security of your administrator account.</p>
                </div>
              </div>

              <div className="admin-settings-placeholder">
                <LockKeyhole size={30} />
                <h3>Password Management</h3>
                <p>
                  The password change form will be connected to your existing
                  password-hashing and authentication setup next.
                </p>
              </div>
            </div>
          )}

          {activeTab === "platform" && (
            <div className="admin-settings-card">
              <div className="admin-settings-card-heading">
                <div className="admin-settings-section-icon">
                  <Settings2 size={21} />
                </div>
                <div>
                  <h2>Platform Settings</h2>
                  <p>Configure Campus Connect platform preferences.</p>
                </div>
              </div>

              <div className="admin-settings-placeholder">
                <Settings2 size={30} />
                <h3>Platform Configuration</h3>
                <p>
                  Platform name, contact information, and placement rules will
                  be added after the profile and security settings are ready.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}