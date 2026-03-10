import { useEffect, useState } from "react";
import "../styles/landing.css";

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 8,
}));

const STATS = [
  { value: "87%", label: "Accuracy Rate" },
  { value: "10K+", label: "Students Helped" },
  { value: "5 min", label: "Quick Assessment" },
];

export default function LandingPage({ onStart }) {
  const [typed, setTyped] = useState("");
  const fullText = "Your Cognitive Health, Decoded.";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTyped(fullText.slice(0, ++i));
      if (i >= fullText.length) clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing">
      {/* Animated particles */}
      <div className="particles">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Nav */}
      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">SynapseGuard</span>
        </div>
        <div className="nav-badge">AI-Powered Health</div>
      </nav>

      {/* Hero */}
      <main className="hero">
        <div className="hero-badge animate-fade-up">
          <span className="badge-dot" />
          <span>Cognitive Health Intelligence Platform</span>
        </div>

        <h1 className="hero-title animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <span className="title-line">SynapseGuard</span>
          <span className="title-sub">{typed}<span className="cursor">|</span></span>
        </h1>

        <p className="hero-desc animate-fade-up" style={{ animationDelay: "0.4s" }}>
          AI-driven analysis of your mental clarity, sleep patterns, stress levels, 
          and academic performance. Get personalized insights in minutes.
        </p>

        {/* Stats */}
        <div className="hero-stats animate-fade-up" style={{ animationDelay: "0.6s" }}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <button
          className="cta-btn animate-fade-up"
          style={{ animationDelay: "0.8s" }}
          onClick={onStart}
        >
          <span className="btn-inner">
            <span>Begin Assessment</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
          <div className="btn-glow" />
        </button>

        <p className="hero-note animate-fade-up" style={{ animationDelay: "1s" }}>
          🔒 Anonymous · Takes 5 minutes · Evidence-based methodology
        </p>
      </main>

      {/* Feature pills */}
      <div className="feature-pills">
        {["🧠 AI Analysis", "📊 Visual Reports", "💬 AI Chatbot", "🏆 Daily Challenges", "📅 Study Scheduler", "🚨 Crisis Support"].map(f => (
          <span key={f} className="pill">{f}</span>
        ))}
      </div>

      {/* Brain SVG */}
      <div className="brain-visual animate-float">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="rgba(0,245,255,0.1)" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" stroke="rgba(139,92,246,0.15)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="40" stroke="rgba(0,245,255,0.2)" strokeWidth="1" />
          {/* Synaptic connections */}
          {[0,45,90,135,180,225,270,315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 100 + 40 * Math.cos(rad);
            const y1 = 100 + 40 * Math.sin(rad);
            const x2 = 100 + 80 * Math.cos(rad);
            const y2 = 100 + 80 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,245,255,0.3)" strokeWidth="0.5" />;
          })}
          <circle cx="100" cy="100" r="8" fill="rgba(0,245,255,0.6)" />
          <circle cx="100" cy="100" r="4" fill="#00f5ff" />
        </svg>
      </div>
    </div>
  );
}
