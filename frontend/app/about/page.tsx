import Link from "next/link";
import {
  GraduationCap,
  Target,
  Users,
  BriefcaseBusiness,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Purpose-driven",
    description:
      "Help students navigate placement opportunities with greater clarity and confidence.",
  },
  {
    icon: Users,
    title: "Connected community",
    description:
      "Bring students, colleges, and recruiters together through one platform.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career-focused",
    description:
      "Make it easier to discover jobs, explore companies, and manage applications.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="section-kicker">ABOUT CAMPUS CONNECT</span>
          <h1>Connecting campus talent with career opportunities.</h1>
          <p>
            Campus Connect is a placement management platform
            designed to simplify how students discover opportunities,
            recruiters find talent, and placement teams coordinate
            recruitment activities.
          </p>
          <Link href="/jobs" className="button button-primary">
            Explore Opportunities <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="about-mission">
        <div className="container about-mission-grid">
          <div>
            <span className="section-kicker">OUR PURPOSE</span>
            <h2>Making the placement journey more organized.</h2>
          </div>

          <div className="about-mission-copy">
            <p>
              Finding the right job after college can involve
              multiple applications, eligibility requirements,
              company details, and recruitment updates.
            </p>
            <p>
              Campus Connect aims to bring these activities
              together in one convenient interface, helping
              students stay informed and recruiters manage
              opportunities more efficiently.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">WHAT WE FOCUS ON</span>
            <h2>Designed around the placement experience</h2>
            <p>
              A shared platform for discovering opportunities
              and managing recruitment activities.
            </p>
          </div>

          <div className="features-grid">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article className="feature-card" key={value.title}>
                  <div className="feature-icon">
                    <Icon size={25} />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-audience">
        <div className="container about-audience-inner">
          <div className="about-audience-icon">
            <GraduationCap size={42} />
          </div>
          <div>
            <span className="section-kicker">BUILT FOR YOUR NEXT STEP</span>
            <h2>One journey. Multiple opportunities.</h2>
            <p>
              Whether you're preparing for your first job or
              managing recruitment, Campus Connect is designed
              to make the process easier to follow.
            </p>
          </div>
          <div className="about-audience-checks">
            <p><CheckCircle2 size={18} /> Discover opportunities</p>
            <p><CheckCircle2 size={18} /> Organize applications</p>
            <p><CheckCircle2 size={18} /> Connect with recruiters</p>
          </div>
        </div>
      </section>
    </main>
  );
}