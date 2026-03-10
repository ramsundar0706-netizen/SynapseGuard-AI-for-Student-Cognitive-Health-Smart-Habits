import { useEffect, useState } from "react";
import "../styles/loading.css";

const STEPS_MSG = [
  { icon: "🧠", text: "Analyzing cognitive patterns..." },
  { icon: "😴", text: "Evaluating sleep architecture..." },
  { icon: "📊", text: "Running burnout prediction model..." },
  { icon: "🌡️", text: "Fetching real-time AQI data..." },
  { icon: "🤖", text: "Generating AI recommendations..." },
  { icon: "📅", text: "Building personalized schedule..." },
  { icon: "✨", text: "Finalizing your health report..." },
];

export default function LoadingAnalysis({ formData, onDone }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, STEPS_MSG.length - 1));
    }, 1000);

    const analyze = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server error: ${res.status}`);
        }

        const result = await res.json();
        clearInterval(interval);
        
        // Minimum display time of 3.5s
        setTimeout(() => onDone({ ...result, formData }), Math.max(0, 3500));
      } catch (err) {
        clearInterval(interval);
        console.error("Analysis error:", err);
        setError(err.message);
      }
    };

    analyze();
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="loading-page">
        <div className="error-box">
          <div className="error-icon">⚠️</div>
          <h3>Analysis Failed</h3>
          <p>{error}</p>
          <p className="error-hint">Make sure the backend is running: <code>python app.py</code></p>
          <button onClick={() => window.location.reload()} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-page">
      <div className="loading-content">
        {/* Logo */}
        <div className="loading-logo">
          <span>⬡</span> SynapseGuard
        </div>

        {/* Brain animation */}
        <div className="brain-ring-wrapper">
          <div className="brain-ring ring-1" />
          <div className="brain-ring ring-2" />
          <div className="brain-ring ring-3" />
          <div className="brain-core">
            <span className="brain-emoji">🧠</span>
          </div>
          {/* Orbiting dots */}
          <div className="orbit-dot dot-1" />
          <div className="orbit-dot dot-2" />
          <div className="orbit-dot dot-3" />
        </div>

        <h2 className="loading-title">Analyzing Your Health Profile</h2>
        <p className="loading-name">Hello, {formData?.name || "Student"} 👋</p>

        {/* Step messages */}
        <div className="loading-steps">
          {STEPS_MSG.map((s, i) => (
            <div
              key={i}
              className={`loading-step ${i < msgIndex ? "done" : ""} ${i === msgIndex ? "active" : ""}`}
            >
              <span className="step-dot" />
              <span className="step-ico">{s.icon}</span>
              <span className="step-txt">{s.text}</span>
              {i < msgIndex && <span className="step-check">✓</span>}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="loading-progress">
          <div
            className="loading-progress-fill"
            style={{ width: `${(msgIndex / (STEPS_MSG.length - 1)) * 100}%` }}
          />
        </div>
        <p className="loading-pct">{Math.round((msgIndex / (STEPS_MSG.length - 1)) * 100)}%</p>
      </div>
    </div>
  );
}
