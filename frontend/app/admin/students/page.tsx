"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Eye,
  Pencil,
  Trash2,
  Power,
  X,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Save,
} from "lucide-react";

type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  college: string;
  graduationYear: number | null;
  status: "Active" | "Inactive";
  joinedDate: string;
};

type ApiStudent = {
  id: string | number;
  full_name?: string;
  name?: string;
  email: string;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  course?: string;
  graduation_year?: number | string | null;
  graduationYear?: number | null;
  is_active?: boolean;
  status?: "Active" | "Inactive";
  created_at?: string;
  joinedDate?: string;
};

type ModalMode = "view" | "edit" | null;

const emptyForm = {
  full_name: "",
  email: "",
  college: "",
  degree: "",
  branch: "",
  graduation_year: "",
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [form, setForm] = useState(emptyForm);

  const pageSize = 5;

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await fetch("/api/admin/students", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load students.");
      }

      if (!Array.isArray(data.students)) {
        throw new Error("The server returned an invalid student list.");
      }

      const formattedStudents: Student[] = (data.students as ApiStudent[]).map(
        (item) => {
          const degree = item.degree ?? "";
          const branch = item.branch ?? "";

          const year = item.graduation_year ?? item.graduationYear ?? null;

          return {
            id: String(item.id),
            name: item.full_name ?? item.name ?? "Unnamed Student",
            email: item.email,
            college: item.college || "Not provided",
            course:
              item.course ||
              [degree, branch].filter(Boolean).join(" - ") ||
              "Not provided",
            graduationYear: year ? Number(year) : null,
            status:
              item.status ??
              (item.is_active === false ? "Inactive" : "Active"),
            joinedDate: item.joinedDate ??
              (item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Not available"),
          };
        }
      );

      setStudents(formattedStudents);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load student records."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term) ||
        student.course.toLowerCase().includes(term) ||
        student.college.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedStudents = filteredStudents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const activeCount = students.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveCount = students.length - activeCount;

  function openView(student: Student) {
    setSelectedStudent(student);
    setModalMode("view");
    setActionError("");
    setSuccessMessage("");
  }

  function openEdit(student: Student) {
    setSelectedStudent(student);

    const parts = student.course.split(" - ");

    setForm({
      full_name: student.name,
      email: student.email,
      college: student.college === "Not provided" ? "" : student.college,
      degree:
        student.course === "Not provided" ? "" : parts.length > 1 ? parts[0] : student.course,
      branch: parts.length > 1 ? parts.slice(1).join(" - ") : "",
      graduation_year: student.graduationYear
        ? String(student.graduationYear)
        : "",
    });

    setModalMode("edit");
    setActionError("");
    setSuccessMessage("");
  }

  function closeModal() {
    if (isSaving) return;

    setModalMode(null);
    setSelectedStudent(null);
    setActionError("");
  }

  async function updateStudent(
    student: Student,
    updates: Record<string, unknown>,
    successText: string
  ) {
    setIsSaving(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/admin/students/${encodeURIComponent(student.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update student.");
      }

      setSuccessMessage(successText);
      await loadStudents();

      return true;
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStudent) return;

    if (!form.full_name.trim() || !form.email.trim()) {
      setActionError("Name and email are required.");
      return;
    }

    const year = form.graduation_year.trim();

    const updates = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      college: form.college.trim() || null,
      degree: form.degree.trim() || null,
      branch: form.branch.trim() || null,
      graduation_year: year ? Number(year) : null,
    };

    if (year && (!Number.isInteger(Number(year)) || Number(year) < 1900 || Number(year) > 2200)) {
      setActionError("Please enter a valid graduation year.");
      return;
    }

    const saved = await updateStudent(
      selectedStudent,
      updates,
      "Student details updated successfully."
    );

    if (saved) {
      setModalMode(null);
      setSelectedStudent(null);
    }
  }

  async function handleToggleStatus(student: Student) {
    const activating = student.status === "Inactive";

    const confirmed = window.confirm(
      activating
        ? `Activate ${student.name}'s account?`
        : `Deactivate ${student.name}'s account? They may lose access to the application.`
    );

    if (!confirmed) return;

    const success = await updateStudent(
      student,
      { is_active: activating },
      activating
        ? "Student account activated successfully."
        : "Student account deactivated successfully."
    );

    if (success) {
      setSelectedStudent(null);
      setModalMode(null);
    }
  }

  async function handleDelete(student: Student) {
    const confirmed = window.confirm(
      `Permanently delete ${student.name}'s account? This action cannot be undone. If the student has applications, deletion will be refused to preserve their history.`
    );

    if (!confirmed) return;

    setActionError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/students/${encodeURIComponent(student.id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete student.");
      }

      setSuccessMessage(data.message || "Student deleted successfully.");
      await loadStudents();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete student."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h1>Manage Students</h1>
          <p>View, edit, activate, and manage registered student accounts.</p>
        </div>

        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() => void loadStudents()}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {successMessage && (
        <div className="admin-success-message" role="status">
          {successMessage}
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccessMessage("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="admin-error-message" role="alert">
          <AlertCircle size={18} />
          <span>{actionError}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setActionError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={22} />
          </div>
          <div>
            <p>Total Students</p>
            <h2>{students.length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserCheck size={22} />
          </div>
          <div>
            <p>Active Students</p>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserX size={22} />
          </div>
          <div>
            <p>Inactive Students</p>
            <h2>{inactiveCount}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <p>Matching Students</p>
            <h2>{filteredStudents.length}</h2>
          </div>
        </div>
      </div>

      <section className="admin-table-card">
        <div className="admin-table-toolbar">
          <div>
            <h2>Student Records</h2>
            <p>Manage student accounts registered in Campus Connect.</p>
          </div>

          <div className="admin-table-filters">
            <div className="admin-search-box">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search students..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search students"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter students by status"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {pageError && (
          <div className="admin-error-message" role="alert">
            <AlertCircle size={18} />
            <span>{pageError}</span>
            <button type="button" onClick={() => void loadStudents()}>
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="admin-loading-state">
            <LoaderCircle size={28} className="animate-spin" />
            <p>Loading student records...</p>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>College</th>
                    <th>Graduation</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="admin-student-cell">
                          <div className="admin-student-avatar">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{student.name}</strong>
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{student.course}</td>
                      <td>{student.college}</td>
                      <td>{student.graduationYear ?? "—"}</td>

                      <td>
                        <span
                          className={`admin-status-badge ${
                            student.status === "Active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td>{student.joinedDate}</td>

                      <td>
                        <div className="admin-action-buttons">
                          <button
                            type="button"
                            title="View student"
                            aria-label={`View ${student.name}`}
                            onClick={() => openView(student)}
                            className="admin-icon-btn"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Edit student"
                            aria-label={`Edit ${student.name}`}
                            onClick={() => openEdit(student)}
                            className="admin-icon-btn"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title={
                              student.status === "Active"
                                ? "Deactivate student"
                                : "Activate student"
                            }
                            aria-label={
                              student.status === "Active"
                                ? `Deactivate ${student.name}`
                                : `Activate ${student.name}`
                            }
                            disabled={isSaving}
                            onClick={() => void handleToggleStatus(student)}
                            className="admin-icon-btn"
                          >
                            <Power size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete student"
                            aria-label={`Delete ${student.name}`}
                            disabled={isSaving}
                            onClick={() => void handleDelete(student)}
                            className="admin-icon-btn danger"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="admin-empty-cell">
                        {students.length === 0
                          ? "No student accounts found."
                          : "No students match your search or filter."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-table-pagination">
              <p>
                Showing{" "}
                {filteredStudents.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}{" "}
                to {Math.min(safePage * pageSize, filteredStudents.length)} of{" "}
                {filteredStudents.length} students
              </p>

              <div>
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage(safePage - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {safePage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage(safePage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {modalMode && selectedStudent && (
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
            aria-labelledby="student-modal-title"
          >
            <div className="admin-modal-header">
              <div>
                <h2 id="student-modal-title">
                  {modalMode === "view" ? "Student Details" : "Edit Student"}
                </h2>
                <p>{selectedStudent.name}</p>
              </div>

              <button
                type="button"
                className="admin-icon-btn"
                onClick={closeModal}
                aria-label="Close dialog"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            {modalMode === "view" ? (
              <div className="admin-student-details">
                <div>
                  <span>Student ID</span>
                  <strong>{selectedStudent.id}</strong>
                </div>
                <div>
                  <span>Full Name</span>
                  <strong>{selectedStudent.name}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selectedStudent.email}</strong>
                </div>
                <div>
                  <span>College</span>
                  <strong>{selectedStudent.college}</strong>
                </div>
                <div>
                  <span>Course</span>
                  <strong>{selectedStudent.course}</strong>
                </div>
                <div>
                  <span>Graduation Year</span>
                  <strong>{selectedStudent.graduationYear ?? "Not provided"}</strong>
                </div>
                <div>
                  <span>Account Status</span>
                  <strong>{selectedStudent.status}</strong>
                </div>
                <div>
                  <span>Joined Date</span>
                  <strong>{selectedStudent.joinedDate}</strong>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => openEdit(selectedStudent)}
                  >
                    <Pencil size={16} />
                    Edit Details
                  </button>

                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => void handleToggleStatus(selectedStudent)}
                    disabled={isSaving}
                  >
                    <Power size={16} />
                    {selectedStudent.status === "Active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="admin-edit-form">
                <label>
                  Full Name *
                  <input
                    required
                    value={form.full_name}
                    onChange={(event) =>
                      setForm({ ...form, full_name: event.target.value })
                    }
                  />
                </label>

                <label>
                  Email Address *
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                  />
                </label>

                <label>
                  College
                  <input
                    value={form.college}
                    onChange={(event) =>
                      setForm({ ...form, college: event.target.value })
                    }
                  />
                </label>

                <div className="admin-form-row">
                  <label>
                    Degree
                    <input
                      value={form.degree}
                      onChange={(event) =>
                        setForm({ ...form, degree: event.target.value })
                      }
                      placeholder="B.Tech"
                    />
                  </label>

                  <label>
                    Branch
                    <input
                      value={form.branch}
                      onChange={(event) =>
                        setForm({ ...form, branch: event.target.value })
                      }
                      placeholder="Computer Science"
                    />
                  </label>
                </div>

                <label>
                  Graduation Year
                  <input
                    type="number"
                    min="1900"
                    max="2200"
                    value={form.graduation_year}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        graduation_year: event.target.value,
                      })
                    }
                  />
                </label>

                {actionError && (
                  <div className="admin-error-message" role="alert">
                    {actionError}
                  </div>
                )}

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={closeModal}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-primary-btn"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}