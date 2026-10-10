import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  FileText,
  GraduationCap,
  Search,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Discover Opportunities",
    description:
      "Explore job openings and internships that match your interests, skills, and career goals.",
  },
  {
    icon: Target,
    title: "Find the Right Fit",
    description:
      "Review job requirements and eligibility criteria before applying for a position.",
  },
  {
    icon: FileText,
    title: "Track Applications",
    description:
      "Keep your applications organized and follow their progress from submission to selection.",
  },
  {
    icon: CalendarCheck,
    title: "Stay Prepared",
    description:
      "Keep track of recruitment activities, interview schedules, and upcoming opportunities.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Register and showcase your education, skills, projects, and experience.",
  },
  {
    number: "02",
    title: "Explore opportunities",
    description:
      "Browse jobs, review eligibility requirements, and discover suitable companies.",
  },
  {
    number: "03",
    title: "Apply and track",
    description:
      "Apply for suitable positions and keep track of your application journey.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-kicker">
              YOUR CAREER JOURNEY STARTS HERE
            </span>

            <h1>
              Turn your potential into your{" "}
              <span>profession.</span>
            </h1>

            <p className="hero-description">
              Your journey from campus to career starts here.
              Discover opportunities, connect with recruiters,
              and take the next step toward your future with
              Campus Connect.
            </p>

            <div className="hero-actions">
              <Link href="/jobs" className="button button-primary">
                Explore Jobs <ArrowRight size={17} />
              </Link>

              <Link
                href="/register"
                className="button button-secondary"
              >
                Create Account <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="hero-trust">
              <CheckCircle2 size={17} />
              <span>
                One platform for your placement journey
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-circle" />

            <div className="hero-cap">
              <GraduationCap size={94} strokeWidth={1.3} />
            </div>

            <div className="hero-float-card hero-float-one">
              <div className="mini-icon">
                <BriefcaseBusiness size={22} />
              </div>
              <div>
                <strong>Career Opportunities</strong>
                <small>Your next step starts here</small>
              </div>
            </div>

            <div className="hero-float-card hero-float-two">
              <div className="mini-icon">
                <TrendingUp size={22} />
              </div>
              <div>
                <strong>Keep Moving Forward</strong>
                <small>Build skills. Grow. Succeed.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform highlights */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <strong>
                <Users size={24} />
              </strong>
              <span>Student-focused platform</span>
            </div>

            <div className="stat-item">
              <strong>
                <Building2 size={24} />
              </strong>
              <span>Company opportunities</span>
            </div>

            <div className="stat-item">
              <strong>
                <BriefcaseBusiness size={24} />
              </strong>
              <span>Job discovery</span>
            </div>

            <div className="stat-item">
              <strong>
                <Target size={24} />
              </strong>
              <span>Placement preparation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">
              WHY CAMPUS CONNECT?
            </span>

            <h2>
              Everything you need for your placement journey
            </h2>

            <p>
              From exploring opportunities to tracking applications,
              bring your placement activities together in one place.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon size={25} />
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">
              HOW IT WORKS
            </span>

            <h2>Three steps toward your next opportunity</h2>

            <p>
              Start with your profile, explore relevant openings,
              and manage your applications in one place.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-panel">
            <div className="cta-content">
              <span className="section-kicker">
                TAKE THE NEXT STEP
              </span>

              <h2>Your future deserves a great starting point.</h2>

              <p>
                Create your account and start exploring your
                placement opportunities.
              </p>
            </div>

            <Link href="/register" className="button">
              Get Started <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}