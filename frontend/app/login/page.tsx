"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("Student");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError(
      "Login is not connected yet. Authentication will be enabled when the backend is ready."
    );
  }

  return (
    <section className="auth-page">
      <div className="auth-layout">
        <div className="auth-intro">
          <Link href="/" className="auth-brand">
            <span className="auth-brand-icon">
              <GraduationCap size={26} />
            </span>
            <span>Campus Connect</span>
          </Link>

          <span className="section-kicker">WELCOME BACK</span>
          <h1>Your next opportunity starts with a simple step.</h1>
          <p>
            Sign in to explore opportunities, manage your applications, and
            stay connected throughout your placement journey.
          </p>

          <div className="auth-benefits">
            <div>
              <span className="auth-benefit-icon">
                <BriefcaseBusiness size={20} />
              </span>
              <div>
                <strong>Explore opportunities</strong>
                <p>Find jobs and internships that fit your goals.</p>
              </div>
            </div>

            <div>
              <span className="auth-benefit-icon">
                <GraduationCap size={20} />
              </span>
              <div>
                <strong>Manage your journey</strong>
                <p>Keep your career activities organized in one place.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <h2>Sign in to your account</h2>
            <p>Enter your account details below.</p>
          </div>

          <div className="auth-role-selector" aria-label="Account type">
            <button
              type="button"
              className={role === "Student" ? "active" : ""}
              onClick={() => setRole("Student")}
            >
              <GraduationCap size={17} />
              Student
            </button>

            <button
              type="button"
              className={role === "Recruiter" ? "active" : ""}
              onClick={() => setRole("Recruiter")}
            >
              <BriefcaseBusiness size={17} />
              Recruiter
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

            <div className="auth-form-options">
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            {error && (
              <p className="auth-message" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="button button-primary auth-submit">
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link href="/register">Create one</Link>
          </p>

          <p className="auth-demo-note">
            Demo interface · No credentials are verified or stored.
          </p>
        </div>
      </div>
    </section>
  );
}
