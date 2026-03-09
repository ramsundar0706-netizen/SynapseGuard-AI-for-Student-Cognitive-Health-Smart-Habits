import { useEffect, useRef } from "react";
import "../styles/landing.css";

export default function LandingPage({ onStart }) {

  const canvasRef = useRef(null);

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    let particles = [];
    let raf;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? "#00e5ff" : "#b388ff",
        opacity: Math.random() * 0.6 + 0.2
      });
    }

    const draw = () => {

      ctx.clearRect(0, 0, W, H);

      particles.forEach((p) => {

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      // Draw connections
      ctx.globalAlpha = 0.08;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {

          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#00e5ff";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };

  }, []);

  return (
    <div className="landing">

      <canvas ref={canvasRef} className="landing-canvas" />

      <header className="landing-header">

        <div className="logo">
          <div className="logo-mark">⬡</div>
          <span>Synapse<em>Guard</em></span>
        </div>

        <div className="header-pill">
          🧪 Hackathon Demo — Health & Wellbeing
        </div>

      </header>

      <main className="landing-main">

        <div className="landing-tag">
          AI · Cognitive Health · Smart Habits
        </div>

        <h1 className="landing-title">
          Your Brain<br />
          <em>Deserves</em><br />
          Better Data
        </h1>

        <p className="landing-desc">
          SynapseGuard analyses your sleep, screen time, stress, mood &
          environment to generate a personalised cognitive health report
          powered by AI.
        </p>

        <div className="landing-stats">

          <div className="stat">
            <span className="stat-num">8+</span>
            <span className="stat-label">Health Inputs</span>
          </div>

          <div className="stat-divider" />

          <div className="stat">
            <span className="stat-num">AI</span>
            <span className="stat-label">Powered Analysis</span>
          </div>

          <div className="stat-divider" />

          <div className="stat">
            <span className="stat-num">AQI</span>
            <span className="stat-label">Live Air Quality</span>
          </div>

        </div>

        <button className="btn-cta" onClick={onStart}>
          <span>Begin Your Assessment</span>

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <p className="landing-note">
          Takes ~3 minutes · 100% private · No account needed
        </p>

      </main>

      <div className="landing-grid-overlay" />

    </div>
  );
}