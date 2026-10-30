"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  LoaderCircle,
  MapPin,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  X,
} from "lucide-react";

type Recruiter = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  location: string;
  status: "Active" | "Inactive";
  joinedDate: string;
};

type RecruiterForm = {
  full_name: string;
  email: string;
  organization: string;
  phone: string;
  location: string;
};

const emptyForm: RecruiterForm = {
  full_name: "",
  email: "",
  organization: "",
  phone: "",
  location: "",
};

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRecruiter, setSelectedRecruiter] =
    useState<Recruiter | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);
  const [form, setForm] = useState<RecruiterForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRecruiters = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/recruiters", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load recruiters.");
      }

      setRecruiters(data.recruiters ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load recruiters."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecruiters();
  }, [loadRecruiters]);

  const activeCount = recruiters.filter(
    (recruiter) => recruiter.status === "Active"
  ).length;

  const inactiveCount = recruiters.length - activeCount;

  const filteredRecruiters = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recruiters.filter((recruiter) => {
      const matchesSearch =
        !query ||
        [
          recruiter.name,
          recruiter.email,
          recruiter.company,
          recruiter.location,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || recruiter.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [recruiters, search, statusFilter]);

  function openView(recruiter: Recruiter) {
    setSelectedRecruiter(recruiter);
    setModalMode("view");
    setError("");
    setSuccess("");
  }

  function openEdit(recruiter: Recruiter) {
    setSelectedRecruiter(recruiter);

    setForm({
      full_name: recruiter.name === "Not provided" ? "" : recruiter.name,
      email: recruiter.email === "Not provided" ? "" : recruiter.email,
      organization:
        recruiter.company === "Not provided" ? "" : recruiter.company,
      phone: recruiter.phone === "Not provided" ? "" : recruiter.phone,
      location:
        recruiter.location === "Not provided" ? "" : recruiter.location,
    });

    setModalMode("edit");
    setError("");
    setSuccess("");
  }

  function closeModal() {
    if (saving) return;

    setModalMode(null);
    setSelectedRecruiter(null);
    setForm(emptyForm);
  }

  async function saveRecruiter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRecruiter) return;

    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Recruiter name and email are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/recruiters/${selectedRecruiter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            organization: form.organization,
            phone: form.phone,
            location: form.location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save recruiter.");
      }

      setSuccess("Recruiter details updated successfully.");
      setModalMode(null);
      setSelectedRecruiter(null);
      await loadRecruiters();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save recruiter."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(recruiter: Recruiter) {
    const activating = recruiter.status === "Inactive";

    const confirmed = window.confirm(
      activating
        ? `Activate ${recruiter.name}'s account?`
        : `Deactivate ${recruiter.name}'s account?`
    );

    if (!confirmed) return;

    setUpdatingId(recruiter.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/recruiters/${recruiter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: activating }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update account status.");
      }

      setSuccess(
        activating
          ? "Recruiter account activated successfully."
          : "Recruiter account deactivated successfully."
      );

      await loadRecruiters();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update account status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function initials(name: string) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-breadcrumb">
        <span>Admin</span>
        <span>/</span>
        <span>Recruiters</span>
      </div>

      <div>
        <p className="admin-eyebrow-green">RECRUITER MANAGEMENT</p>

        <div className="admin-table-card-header" style={{ padding: 0, border: 0 }}>
          <div>
            <h1 className="admin-page-heading">Recruiters</h1>
            <p className="admin-page-description">
              Manage recruiter accounts and their company information.
            </p>
          </div>

          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() => void loadRecruiters()}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {success && (
        <div className="admin-success-message" role="status">
          <CheckCircle2 size={18} />
          <span>{success}</span>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="Dismiss message"
            onClick={() => setSuccess("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && !modalMode && (
        <div className="admin-error-message" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() => void loadRecruiters()}
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserRound size={21} />
          </div>
          <span className="admin-stat-label">Total Recruiters</span>
          <strong className="admin-stat-value">{recruiters.length}</strong>
          <span className="admin-stat-caption">Registered recruiter accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserCheck size={21} />
          </div>
          <span className="admin-stat-label">Active Recruiters</span>
          <strong className="admin-stat-value">{activeCount}</strong>
          <span className="admin-stat-caption">Currently active accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserX size={21} />
          </div>
          <span className="admin-stat-label">Inactive Recruiters</span>
          <strong className="admin-stat-value">{inactiveCount}</strong>
          <span className="admin-stat-caption">Disabled accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ShieldCheck size={21} />
          </div>
          <span className="admin-stat-label">Matching Results</span>
          <strong className="admin-stat-value">
            {filteredRecruiters.length}
          </strong>
          <span className="admin-stat-caption">Based on current filters</span>
        </div>
      </div>

      {/* Recruiters table */}
      <section className="admin-table-card">
        <div className="admin-table-card-header">
          <div>
            <h2>All Recruiters</h2>
            <p>Review and manage registered recruiter accounts.</p>
          </div>
        </div>

        <div className="admin-table-toolbar">
          <div className="admin-table-filters">
            <label className="admin-search-box">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search name, email or company..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              className="admin-student-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by recruiter status"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                className="admin-reset-filters"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <LoaderCircle size={22} />
            Loading recruiters...
          </div>
        ) : error && recruiters.length === 0 ? (
          <div className="admin-empty-state">
            <UserRound size={32} />
            <h3>Unable to load recruiters</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Recruiter</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecruiters.map((recruiter) => (
                    <tr key={recruiter.id}>
                      <td>
                        <div className="admin-student-cell">
                          <div className="admin-student-avatar">
                            {initials(recruiter.name || "R")}
                          </div>

                          <div className="admin-student-identity-text">
                            <span className="admin-student-name">
                              {recruiter.name}
                            </span>
                            <span className="admin-student-email">
                              {recruiter.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-student-course">
                          {recruiter.company}
                        </span>
                      </td>

                      <td>
                        <span className="admin-student-course">
                          {recruiter.location}
                        </span>
                      </td>

                      <td>{recruiter.joinedDate}</td>

                      <td>
                        <span
                          className={`admin-status-badge ${
                            recruiter.status === "Active"
                              ? "admin-status-active"
                              : "admin-status-inactive"
                          }`}
                        >
                          {recruiter.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-action-buttons">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            title="View recruiter"
                            aria-label={`View ${recruiter.name}`}
                            onClick={() => openView(recruiter)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="admin-icon-btn"
                            title="Edit recruiter"
                            aria-label={`Edit ${recruiter.name}`}
                            onClick={() => openEdit(recruiter)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="admin-icon-btn"
                            title={
                              recruiter.status === "Active"
                                ? "Deactivate recruiter"
                                : "Activate recruiter"
                            }
                            aria-label={`${
                              recruiter.status === "Active"
                                ? "Deactivate"
                                : "Activate"
                            } ${recruiter.name}`}
                            disabled={updatingId === recruiter.id}
                            onClick={() => void toggleStatus(recruiter)}
                          >
                            {updatingId === recruiter.id ? (
                              <LoaderCircle
                                size={16}
                                className="admin-inline-spinner"
                              />
                            ) : recruiter.status === "Active" ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredRecruiters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="admin-empty-cell">
                        {recruiters.length === 0
                          ? "No recruiter accounts have been registered yet."
                          : "No recruiters match your search or filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-table-pagination">
              <span className="admin-pagination-info">
                Showing {filteredRecruiters.length} of {recruiters.length} recruiters
              </span>
            </div>
          </>
        )}
      </section>

      {/* View / Edit modal */}
      {selectedRecruiter && modalMode && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruiter-modal-title"
          >
            <div className="admin-modal-header">
              <div>
                <h2 id="recruiter-modal-title">
                  {modalMode === "edit"
                    ? "Edit Recruiter"
                    : "Recruiter Details"}
                </h2>
                <p>
                  {modalMode === "edit"
                    ? "Update recruiter and company information."
                    : "View registered recruiter account information."}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {modalMode === "view" ? (
              <div className="admin-modal-body">
                <div className="admin-student-modal-profile">
                  <div className="admin-student-modal-avatar">
                    {initials(selectedRecruiter.name || "R")}
                  </div>

                  <div>
                    <h3>{selectedRecruiter.name}</h3>
                    <p>{selectedRecruiter.email}</p>
                    <span
                      className={`admin-status-badge ${
                        selectedRecruiter.status === "Active"
                          ? "admin-status-active"
                          : "admin-status-inactive"
                      }`}
                    >
                      {selectedRecruiter.status}
                    </span>
                  </div>
                </div>

                <div className="admin-student-details">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Company</span>
                    <div className="admin-detail-value">
                      <Building2
                        size={15}
                        style={{
                          display: "inline",
                          marginRight: 6,
                          verticalAlign: "middle",
                        }}
                      />
                      {selectedRecruiter.company}
                    </div>
                  </div>

                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Phone</span>
                    <div className="admin-detail-value">
                      {selectedRecruiter.phone}
                    </div>
                  </div>

                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Location</span>
                    <div className="admin-detail-value">
                      <MapPin
                        size={15}
                        style={{
                          display: "inline",
                          marginRight: 6,
                          verticalAlign: "middle",
                        }}
                      />
                      {selectedRecruiter.location}
                    </div>
                  </div>

                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Joined Date</span>
                    <div className="admin-detail-value">
                      {selectedRecruiter.joinedDate}
                    </div>
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={closeModal}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => openEdit(selectedRecruiter)}
                  >
                    <Pencil size={15} />
                    Edit Recruiter
                  </button>
                </div>
              </div>
            ) : (
              <form className="admin-edit-form" onSubmit={saveRecruiter}>
                <div className="admin-modal-body">
                  {error && (
                    <div className="admin-error-message" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="admin-form-section">
                    <h3 className="admin-form-section-title">
                      <UserRound size={18} />
                      Personal Information
                    </h3>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label htmlFor="recruiter-name">Full Name *</label>
                        <input
                          id="recruiter-name"
                          value={form.full_name}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              full_name: event.target.value,
                            })
                          }
                          required
                          maxLength={100}
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="recruiter-email">Email Address *</label>
                        <input
                          id="recruiter-email"
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            setForm({ ...form, email: event.target.value })
                          }
                          required
                          maxLength={254}
                          placeholder="recruiter@company.com"
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label htmlFor="recruiter-phone">Phone Number</label>
                        <input
                          id="recruiter-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(event) =>
                            setForm({ ...form, phone: event.target.value })
                          }
                          maxLength={30}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="recruiter-location">Location</label>
                        <input
                          id="recruiter-location"
                          value={form.location}
                          onChange={(event) =>
                            setForm({ ...form, location: event.target.value })
                          }
                          maxLength={150}
                          placeholder="City, state"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-section">
                    <h3 className="admin-form-section-title">
                      <Building2 size={18} />
                      Company Information
                    </h3>

                    <div className="admin-form-row">
                      <div className="admin-form-group full-width">
                        <label htmlFor="recruiter-company">
                          Company / Organization
                        </label>
                        <input
                          id="recruiter-company"
                          value={form.organization}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              organization: event.target.value,
                            })
                          }
                          maxLength={150}
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-hint">
                    Account status can be changed using the activation button
                    in the recruiters table.
                  </div>

                  <div className="admin-modal-actions">
                    <button
                      type="button"
                      className="admin-secondary-btn"
                      onClick={closeModal}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="admin-primary-btn"
                      disabled={saving}
                    >
                      {saving ? (
                        <LoaderCircle
                          size={16}
                          className="admin-inline-spinner"
                        />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}