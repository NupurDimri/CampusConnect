"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Find Jobs", href: "/jobs" },
    { label: "Companies", href: "/companies" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <GraduationCap size={25} />
          </span>

          <span className="brand-text">
            Campus<span>Connect</span>
            <small>YOUR CAREER STARTS HERE</small>
          </span>
        </Link>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/login"
            className="mobile-login"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>

        <div className="nav-actions">
          <Link href="/login" className="login-link">
            Login
          </Link>

          <Link
            href="/register"
            className="button button-primary nav-cta"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
    </header>
  );
}