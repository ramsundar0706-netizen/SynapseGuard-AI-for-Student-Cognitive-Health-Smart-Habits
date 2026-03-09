import { useEffect, useState } from "react";
import "../styles/loading.css";

const STAGES = [
  { text: "Scanning sleep patterns…",       icon: "😴", delay: 0 },
  { text: "Mapping cognitive load…",        icon: "🧠", delay: 1600 },
  { text: "Analysing screen exposure…",     icon: "📱", delay: 3200 },
  { text: "Fetching live AQI data…",        icon: "🌍", delay: 4800 },
  { text: "Running AI health model…",       icon: "⚡", delay: 6400 },
  { text: "Generating your report…",        icon: "📊", delay: 8000 },
];

export default function LoadingAnalysis() {
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    STAGES.forEach((s, i) => {
      setTimeout(() => setActiveStage(i), s.delay);
    });
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 1, 97));
    }, 95);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-bg-grid" />
      <div className="loading-orb orb1" />
      <div className="loading-orb orb2" />

      <div className="loading-center">
        <div className="brain-container">
          <div className="brain-ring ring1" />
          <div className="brain-ring ring2" />
          <div className="brain-ring ring3" />
          <div className="brain-core">🧠</div>
        </div>

        <h2 className="loading-title">Analysing Your Cognitive Profile</h2>
        <p className="loading-sub">Our AI is processing your data…</p>

        <div className="loading-bar-wrap">
          <div className="loading-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="loading-percent">{progress}%</div>

        <div className="stages">
          {STAGES.map((s, i) => (
            <div key={i} className={`stage ${i < activeStage ? "done" : i === activeStage ? "active" : "pending"}`}>
              <span className="stage-icon">{s.icon}</span>
              <span className="stage-text">{s.text}</span>
              {i < activeStage && <span className="stage-check">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
