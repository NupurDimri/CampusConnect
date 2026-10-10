import Link from "next/link";
import {
  GraduationCap,
  ArrowUpRight,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        {/* Brand section */}
        <div className="footer-brand">
          <Link href="/" className="brand footer-brand-link">
            <span className="brand-icon">
              <GraduationCap size={25} />
            </span>

            <span className="brand-text">
              Campus<span>Connect</span>
              <small>YOUR CAREER STARTS HERE</small>
            </span>
          </Link>

          <p className="footer-description">
            Connecting students, colleges, and recruiters
            to make the placement journey easier.
          </p>

          <p className="footer-contact">
            <Mail size={16} />
            <span>placement@campusconnect.com</span>
          </p>

          <p className="footer-contact">
            <MapPin size={16} />
            <span>India</span>
          </p>
        </div>

        {/* Explore links */}
        <div className="footer-column">
          <h3>Explore</h3>
          <Link href="/">Home</Link>
          <Link href="/jobs">Find Jobs</Link>
          <Link href="/companies">Companies</Link>
          <Link href="/about">About Us</Link>
        </div>

        {/* Account links */}
        <div className="footer-column">
          <h3>Get Started</h3>
          <Link href="/register">Create Account</Link>
          <Link href="/login">Student Login</Link>
          <Link href="/login">Recruiter Login</Link>
        </div>

        {/* Call to action */}
        <div className="footer-message">
          <span className="section-kicker">
            YOUR FUTURE STARTS HERE
          </span>

          <p>Make your next opportunity count.</p>

          <Link href="/register" className="footer-join-link">
            Join Campus Connect
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="container footer-bottom">
  <p>
    Copyright 2026 Campus Connect.
    All rights reserved.
  </p>

  <p>Connecting ambition with opportunity.</p>
</div>
    </footer>
  );
}