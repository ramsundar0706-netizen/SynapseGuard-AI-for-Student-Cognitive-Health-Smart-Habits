import { useEffect, useState, useRef } from "react";
import "../styles/landing.css";

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 7.3 + 11) % 100,
  y: (i * 13.7 + 5) % 100,
  size: (i % 4) + 1,
  delay: (i * 0.3) % 6,
  duration: 8 + (i % 8),
  cyan: i % 3 !== 0,
}));

const NODES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const r = i % 2 === 0 ? 38 : 58;
  return {
    id: i,
    cx: 70 + r * Math.cos(angle),
    cy: 70 + r * Math.sin(angle),
    r: i % 3 === 0 ? 4 : 2.5,
    delay: i * 0.2,
  };
});

const STATS = [
  { value: "87%", label: "Accuracy Rate", icon: "🎯" },
  { value: "10K+", label: "Students Helped", icon: "🎓" },
  { value: "5 min", label: "Quick Assessment", icon: "⚡" },
];

const PILLS = [
  "🧠 AI Analysis", "📊 Visual Reports", "💬 AI Chatbot",
  "🏆 Daily Challenges", "📅 Study Scheduler", "🚨 Crisis Support"
];

export default function LandingPage({ onStart }) {
  const [typed, setTyped] = useState("");
  const [counters, setCounters] = useState([0, 0, 0]);
  const [pillVisible, setPillVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const fullText = "Your Cognitive Health, Decoded.";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTyped(fullText.slice(0, ++i));
      if (i >= fullText.length) clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const targets = [87, 10000, 5];
    const duration = 1800;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters(targets.map(t => Math.round(t * ease)));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPillVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const formatStat = (i, val) => {
    if (i === 0) return val + "%";
    if (i === 1) return val >= 1000 ? (val / 1000).toFixed(0) + "K+" : val;
    return val + " min";
  };

  return (
    <div className="landing">
      <div className="bg-aurora" style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }} />
      <div className="bg-aurora-2" style={{ transform: `translate(${-mousePos.x * 0.2}px, ${-mousePos.y * 0.2}px)` }} />
      <div className="grid-overlay" />
      <div className="scanline" />

      <div className="particles">
        {PARTICLES.map((p) => (
          <div key={p.id} className={`particle ${p.cyan ? "p-cyan" : "p-violet"}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
              animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
          />
        ))}
      </div>

      <nav className="landing-nav">
        <div className="logo">
          <div className="logo-hex-wrap">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <polygon points="14,2 25,8 25,20 14,26 3,20 3,8"
                fill="none" stroke="#00f5ff" strokeWidth="1.5"
                style={{ filter: "drop-shadow(0 0 6px #00f5ff)" }} />
              <circle cx="14" cy="14" r="3" fill="#00f5ff" />
            </svg>
          </div>
          <span className="logo-text">SynapseGuard</span>
        </div>
        <div className="nav-badge"><span className="nav-dot" />AI-Powered Health</div>
      </nav>

      <main className="hero">
        <div className="hero-badge">
          <span className="badge-dot" />
          <span>Cognitive Health Intelligence Platform</span>
        </div>

        <h1 className="hero-title">
          <span className="title-line">
            {"SynapseGuard".split("").map((ch, i) => (
              <span key={i} className="char" style={{ animationDelay: `${i * 0.05}s` }}>{ch}</span>
            ))}
          </span>
          <span className="title-sub">{typed}<span className="cursor">|</span></span>
        </h1>

        <p className="hero-desc">
          AI-driven analysis of your mental clarity, sleep patterns, stress levels,
          and academic performance. Get personalized insights in minutes.
        </p>

        <div className="hero-stats">
          {STATS.map((s, i) => (
            <div key={s.label} className="stat-item" style={{ animationDelay: `${0.8 + i * 0.15}s` }}>
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{formatStat(i, counters[i])}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <button className="cta-btn" onClick={onStart}>
          <span className="btn-inner">
            <span className="btn-text">Begin Assessment</span>
            <span className="btn-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </span>
          <div className="btn-glow" />
          <div className="btn-shimmer" />
        </button>

        <p className="hero-note">🔒 Anonymous · Takes 5 minutes · Evidence-based methodology</p>
      </main>

      <div className={`feature-pills ${pillVisible ? "pills-in" : ""}`}>
        {PILLS.map((f, i) => (
          <span key={f} className="pill" style={{ animationDelay: `${i * 0.08}s` }}>{f}</span>
        ))}
      </div>

      <div className="neural-visual" style={{ transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)` }}>
        <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="65" stroke="rgba(0,245,255,0.06)" strokeWidth="1" />
          <circle cx="70" cy="70" r="55" stroke="rgba(139,92,246,0.08)" strokeWidth="1" strokeDasharray="3 5" className="ring-spin-slow" />
          <circle cx="70" cy="70" r="42" stroke="rgba(0,245,255,0.1)" strokeWidth="1" strokeDasharray="2 4" className="ring-spin-rev" />
          {NODES.map((n, i) =>
            NODES.slice(i + 1, i + 3).map((n2, j) => (
              <line key={`${i}-${j}`} x1={n.cx} y1={n.cy} x2={n2.cx} y2={n2.cy}
                stroke="rgba(0,245,255,0.12)" strokeWidth="0.5" />
            ))
          )}
          {NODES.filter((_, i) => i % 2 === 0).map(n => (
            <line key={`c-${n.id}`} x1={n.cx} y1={n.cy} x2="70" y2="70"
              stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
          ))}
          {NODES.map(n => (
            <circle key={n.id} cx={n.cx} cy={n.cy} r={n.r}
              fill={n.id % 3 === 0 ? "rgba(139,92,246,0.8)" : "rgba(0,245,255,0.7)"}
              className="node-pulse" style={{ animationDelay: `${n.delay}s` }} />
          ))}
          <circle cx="70" cy="70" r="10" fill="rgba(0,245,255,0.08)" stroke="rgba(0,245,255,0.3)" strokeWidth="1" />
          <circle cx="70" cy="70" r="5" fill="rgba(0,245,255,0.5)" className="core-pulse" />
          <circle cx="70" cy="70" r="2.5" fill="#00f5ff" style={{ filter: "drop-shadow(0 0 6px #00f5ff)" }} />
        </svg>
      </div>

      <div className="bottom-fade" />
    </div>
  );
}
