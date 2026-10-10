"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  UserRound,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState("Student");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessageType("error");
      setMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("The passwords do not match.");
      return;
    }

    if (!agree) {
      setMessageType("error");
      setMessage("Please agree to the terms to continue.");
      return;
    }

    setMessageType("success");
    setMessage(
      "Your form looks good! Account creation will be enabled when authentication and the backend are connected."
    );
  }

  return (
    <section className="auth-page register-page">
      <div className="auth-layout">
        <div className="auth-intro">
          <Link href="/" className="auth-brand">
            <span className="auth-brand-icon">
              <GraduationCap size={26} />
            </span>
            <span>Campus Connect</span>
          </Link>

          <span className="section-kicker">START YOUR JOURNEY</span>
          <h1>Build connections that move your career forward.</h1>
          <p>
            Create your account to discover opportunities, connect with
            employers, and manage your placement journey.
          </p>

          <div className="auth-benefits">
            <div>
              <span className="auth-benefit-icon">
                <UserRound size={20} />
              </span>
              <div>
                <strong>A profile built around you</strong>
                <p>Keep your essential account details organized.</p>
              </div>
            </div>

            <div>
              <span className="auth-benefit-icon">
                <BriefcaseBusiness size={20} />
              </span>
              <div>
                <strong>Opportunities in one place</strong>
                <p>Discover jobs and internships as you prepare for your next step.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <h2>Create your account</h2>
            <p>Fill in your details to get started.</p>
          </div>

          <div className="auth-role-selector" aria-label="Choose account type">
            <button
              type="button"
              className={role === "Student" ? "active" : ""}
              onClick={() => {
                setRole("Student");
                setOrganization("");
                setMessage("");
              }}
            >
              <GraduationCap size={17} />
              Student
            </button>

            <button
              type="button"
              className={role === "Recruiter" ? "active" : ""}
              onClick={() => {
                setRole("Recruiter");
                setOrganization("");
                setMessage("");
              }}
            >
              <BriefcaseBusiness size={17} />
              Recruiter
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">
              {role === "Student" ? "Full name" : "Recruiter name"}
            </label>
            <div className="auth-input-wrap">
              <UserRound size={18} />
              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            {role === "Recruiter" && (
              <>
                <label htmlFor="register-organization">Company name</label>
                <div className="auth-input-wrap">
                  <Building2 size={18} />
                  <input
                    id="register-organization"
                    type="text"
                    placeholder="Enter your company name"
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <label htmlFor="register-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={18} />
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label htmlFor="confirm-password">Confirm password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <label className="auth-checkbox auth-terms">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
              />
              <span>
                I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </span>
            </label>

            {message && (
              <p
                className={`auth-message ${messageType === "success" ? "auth-message-success" : ""}`}
                role="status"
              >
                {message}
              </p>
            )}

            <button type="submit" className="button button-primary auth-submit">
              Create Account <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>

          <p className="auth-demo-note">
            Demo interface · Account details are not saved.
          </p>
        </div>
      </div>
    </section>
  );
}
