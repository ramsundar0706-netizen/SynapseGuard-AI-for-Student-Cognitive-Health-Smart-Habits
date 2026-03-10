import { useState, useEffect, useRef } from "react";
import "../styles/report.css";

// ─── CONFETTI ──────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const colors = ["#00f5ff","#8b5cf6","#10b981","#f59e0b","#ef4444","#fff"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2,
    size: Math.random() * 8 + 5,
    rotation: Math.random() * 360,
  }));

  if (!active) return null;
  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece"
          style={{
            left: `${p.x}%`,
            background: p.color,
            width: p.size, height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: p.id % 3 === 0 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

// ─── ANIMATED SCORE RING ───────────────────────────────────────────────────────
function ScoreRing({ score, size = 140, label, color = "#00f5ff" }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    let current = 0;
    const inc = score / 60;
    const timer = setInterval(() => {
      current = Math.min(score, current + inc);
      setDisplayed(Math.round(current));
      if (current >= score) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 75) return "#10b981";
    if (s >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const c = color || getColor(score);

  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius}
          stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius}
          stroke={c} strokeWidth="10" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ filter: `drop-shadow(0 0 8px ${c})`, transition: "stroke-dashoffset 0.05s" }}
        />
        <text x={size/2} y={size/2 - 6} textAnchor="middle"
          fontSize="26" fontWeight="700" fill={c} fontFamily="Syne, sans-serif">{displayed}</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle"
          fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="JetBrains Mono, monospace">/100</text>
      </svg>
      {label && <p className="ring-label">{label}</p>}
    </div>
  );
}

// ─── BODY HEATMAP ──────────────────────────────────────────────────────────────
function BodyHeatmap({ scores }) {
  const zones = [
    { label: "Brain", region: "head", score: scores.mental, x: 95, y: 30, w: 50, h: 50 },
    { label: "Heart", region: "chest", score: Math.round((scores.mental + scores.physical) / 2), x: 95, y: 100, w: 50, h: 45 },
    { label: "Core", region: "abdomen", score: scores.physical, x: 95, y: 158, w: 45, h: 40 },
    { label: "Muscles", region: "limbs", score: scores.habits, x: 95, y: 210, w: 50, h: 45 },
    { label: "Eyes", region: "eyes", score: scores.sleep, x: 95, y: 270, w: 45, h: 35 },
  ];

  const getHeatColor = (s) => {
    if (s >= 75) return "#10b981";
    if (s >= 55) return "#84cc16";
    if (s >= 40) return "#f59e0b";
    if (s >= 25) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="heatmap-container">
      <h3 className="section-title">Body Health Map</h3>
      <div className="heatmap-grid">
        {zones.map(z => (
          <div key={z.label} className="heatmap-zone">
            <div className="zone-bar-bg">
              <div className="zone-bar-fill" style={{
                width: `${z.score}%`,
                background: getHeatColor(z.score),
                boxShadow: `0 0 8px ${getHeatColor(z.score)}`,
              }} />
            </div>
            <div className="zone-info">
              <span className="zone-emoji">
                {z.label === "Brain" ? "🧠" : z.label === "Heart" ? "❤️" :
                 z.label === "Core" ? "💛" : z.label === "Muscles" ? "💪" : "👁️"}
              </span>
              <span className="zone-label">{z.label}</span>
              <span className="zone-score" style={{ color: getHeatColor(z.score) }}>{z.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MINI TREND CHART ──────────────────────────────────────────────────────────
function TrendChart({ data }) {
  if (!data || data.length < 2) return null;
  const W = 500, H = 120, PAD = 20;
  const vals = data.map(d => d.overall);
  const min = Math.min(...vals) - 5;
  const max = Math.max(...vals) + 5;
  const px = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const py = (v) => PAD + ((max - v) / (max - min)) * (H - PAD * 2);

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(d.overall)}`).join(" ");
  const fill = `${path} L ${px(data.length-1)} ${H} L ${PAD} ${H} Z`;

  return (
    <div className="trend-chart-wrap">
      <h3 className="section-title">Weekly Trend</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg">
        {/* Grid lines */}
        {[25, 50, 75].map(v => (
          <line key={v} x1={PAD} y1={py(v)} x2={W-PAD} y2={py(v)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {/* Fill */}
        <path d={fill} fill="url(#trendGrad)" opacity="0.15" />
        {/* Line */}
        <path d={path} stroke="#00f5ff" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(0,245,255,0.5))" }} />
        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i} cx={px(i)} cy={py(d.overall)} r="5"
            fill="#00f5ff" style={{ filter: "drop-shadow(0 0 4px #00f5ff)" }} />
        ))}
        {/* Labels */}
        {data.map((d, i) => (
          <text key={`lbl-${i}`} x={px(i)} y={H - 4} textAnchor="middle"
            fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono, monospace">
            {d.date}
          </text>
        ))}
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── CHATBOT ───────────────────────────────────────────────────────────────────
function Chatbot({ context, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${context?.formData?.name || "there"}! 👋 I'm your SynapseGuard AI. Ask me anything about your health, study tips, or how to improve your score!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.role !== "system"), userMsg],
          context: { scores: context?.scores, name: context?.formData?.name }
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply || "I couldn't process that. Try again!" }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Connection error. Is the backend running?" }]);
    }
    setLoading(false);
  };

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-panel">
        <div className="chat-header">
          <div className="chat-title">
            <span className="chat-avatar">🤖</span>
            <div>
              <p className="chat-name">SynapseGuard AI</p>
              <p className="chat-status">● Online</p>
            </div>
          </div>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.role === "assistant" && <span className="msg-avatar">🤖</span>}
              <div className="msg-bubble">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg assistant">
              <span className="msg-avatar">🤖</span>
              <div className="msg-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about your health..."
            className="chat-input"
          />
          <button className="chat-send" onClick={send} disabled={loading}>
            {loading ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EMERGENCY HELPLINES ───────────────────────────────────────────────────────
function EmergencyModal({ data, onClose }) {
  if (!data?.show) return null;
  return (
    <div className="emergency-overlay">
      <div className="emergency-panel">
        <div className="emergency-header">
          <span className="emergency-icon">🆘</span>
          <h3>You're Not Alone</h3>
        </div>
        <p className="emergency-msg">{data.message}</p>
        <div className="helplines">
          {data.resources.map((r, i) => (
            <div key={i} className="helpline-item">
              <div className="helpline-info">
                <p className="helpline-name">{r.name}</p>
                <p className="helpline-avail">{r.available}</p>
              </div>
              <a href={`tel:${r.number}`} className="helpline-call">{r.number}</a>
            </div>
          ))}
        </div>
        <button className="emergency-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ─── PDF DOWNLOAD ──────────────────────────────────────────────────────────────
function downloadPDF(data) {
  const { scores, formData } = data;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SynapseGuard Report — ${formData?.name}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #222; }
    h1 { color: #0891b2; }
    .score-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
    .score-card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
    .score-card h3 { margin: 0 0 8px; font-size: 14px; color: #666; text-transform: uppercase; }
    .score-val { font-size: 36px; font-weight: 700; color: #0891b2; }
    .risk { padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 4px; font-size: 14px; }
    .risk.high { background: #fee2e2; color: #dc2626; }
    .risk.moderate { background: #fef9c3; color: #d97706; }
    .risk.low { background: #dcfce7; color: #16a34a; }
  </style>
</head>
<body>
  <h1>🧠 SynapseGuard Health Report</h1>
  <p><strong>Student:</strong> ${formData?.name} | <strong>Course:</strong> ${formData?.course} | <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  <div class="score-grid">
    <div class="score-card"><h3>Overall</h3><div class="score-val">${scores.overall}</div></div>
    <div class="score-card"><h3>Sleep</h3><div class="score-val">${scores.sleep}</div></div>
    <div class="score-card"><h3>Mental</h3><div class="score-val">${scores.mental}</div></div>
    <div class="score-card"><h3>Physical</h3><div class="score-val">${scores.physical}</div></div>
    <div class="score-card"><h3>Habits</h3><div class="score-val">${scores.habits}</div></div>
  </div>
  <h2>Risk Assessment</h2>
  <span class="risk ${scores.burnout_risk.toLowerCase()}">Burnout Risk: ${scores.burnout_risk}</span>
  <span class="risk ${scores.depression_risk.toLowerCase()}">Depression Risk: ${scores.depression_risk}</span>
  <p style="color: #999; font-size: 12px; margin-top: 40px;">Generated by SynapseGuard AI · Not a medical diagnosis</p>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SynapseGuard_${formData?.name || "Report"}_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── MAIN REPORT PAGE ──────────────────────────────────────────────────────────
export default function ReportPage({ data, onRetake }) {
  const [showChat, setShowChat] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());

  const { scores, aqi, recommendations, schedule, streak, weekly_history, emergency_resources, challenges, formData } = data || {};
  const showConfetti = scores?.overall >= 70;

  useEffect(() => {
    // Auto-show emergency modal if high risk
    if (emergency_resources?.show) {
      setTimeout(() => setShowEmergency(true), 2000);
    }

    // Fetch weekly data
    fetch("http://localhost:5000/api/weekly")
      .then(r => r.json())
      .then(d => setWeeklyData(d.data || []))
      .catch(() => {});
  }, []);

  if (!data || !scores) {
    return <div className="report-page"><div style={{ textAlign: "center", padding: 80 }}>
      <p>No data found. <button onClick={onRetake} style={{ color: "#00f5ff", background: "none", border: "none", cursor: "pointer" }}>Start over</button></p>
    </div></div>;
  }

  const getRiskBadge = (level) => {
    const classes = { High: "badge-red", Moderate: "badge-amber", Low: "badge-green" };
    return classes[level] || "badge-green";
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return { label: "Excellent", color: "#10b981" };
    if (s >= 65) return { label: "Good", color: "#84cc16" };
    if (s >= 50) return { label: "Fair", color: "#f59e0b" };
    if (s >= 35) return { label: "Poor", color: "#f97316" };
    return { label: "Critical", color: "#ef4444" };
  };

  const overall = getScoreLabel(scores.overall);

  return (
    <div className="report-page">
      <Confetti active={showConfetti} />
      <EmergencyModal data={showEmergency ? emergency_resources : null} onClose={() => setShowEmergency(false)} />

      {/* Chatbot */}
      {showChat && <Chatbot context={data} onClose={() => setShowChat(false)} />}

      {/* Floating chat button */}
      <button className="chat-fab" onClick={() => setShowChat(true)} title="Ask SynapseGuard AI">
        🤖
        <span className="fab-label">Ask AI</span>
      </button>

      <div className="report-container">
        {/* HEADER */}
        <header className="report-header">
          <div className="report-logo">
            <span>⬡</span> SynapseGuard
          </div>
          <div className="report-meta">
            {streak > 1 && (
              <div className="streak-badge">
                🔥 {streak} day streak!
              </div>
            )}
            <div className="aqi-badge" style={{ borderColor: aqi?.color, color: aqi?.color }}>
              🌫️ AQI {aqi?.aqi} · {aqi?.label}
            </div>
          </div>
        </header>

        {/* HERO SCORE */}
        <section className="hero-score-section">
          <div className="hero-score-left">
            <div className="student-greeting">
              <h2>Health Report</h2>
              <p>{formData?.name} · {formData?.course} {formData?.year && `· Year ${formData.year}`}</p>
              <p className="report-date">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            <div className="overall-score-display">
              <ScoreRing score={scores.overall} size={180} color={overall.color} />
              <div className="overall-label-block">
                <p className="overall-status" style={{ color: overall.color }}>{overall.label}</p>
                <p className="overall-sub">Cognitive Health Score</p>
                <div className="risk-badges">
                  <span className={`risk-badge ${getRiskBadge(scores.burnout_risk)}`}>
                    ⚡ Burnout: {scores.burnout_risk}
                  </span>
                  <span className={`risk-badge ${getRiskBadge(scores.depression_risk)}`}>
                    🧠 Mood Risk: {scores.depression_risk}
                  </span>
                </div>
                {scores.depression_risk === "High" && (
                  <button className="emergency-btn" onClick={() => setShowEmergency(true)}>
                    🆘 View Support Resources
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="sub-scores-grid">
            {[
              { label: "Sleep", score: scores.sleep, icon: "😴" },
              { label: "Mental", score: scores.mental, icon: "🧠" },
              { label: "Physical", score: scores.physical, icon: "💪" },
              { label: "Habits", score: scores.habits, icon: "⚡" },
            ].map(s => (
              <div key={s.label} className="sub-score-card">
                <span className="sub-icon">{s.icon}</span>
                <ScoreRing score={s.score} size={90} />
                <p className="sub-label">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WEEKLY TREND + BODY HEATMAP */}
        <section className="charts-section">
          {weeklyData.length > 1 && <TrendChart data={weeklyData} />}
          <BodyHeatmap scores={scores} />
        </section>

        {/* AI RECOMMENDATIONS */}
        {recommendations?.length > 0 && (
          <section className="recs-section">
            <h3 className="section-title">🤖 AI Recommendations</h3>
            <div className="recs-grid">
              {recommendations.map((r, i) => (
                <div key={i} className={`rec-card priority-${r.priority}`}>
                  <div className="rec-header">
                    <span className="rec-emoji">{r.emoji}</span>
                    <div>
                      <p className="rec-title">{r.title}</p>
                      <span className={`priority-tag ${r.priority}`}>{r.priority} priority</span>
                    </div>
                  </div>
                  <p className="rec-tip">{r.tip}</p>
                  <div className="rec-category">{r.category}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STUDY SCHEDULE */}
        {schedule && (
          <section className="schedule-section">
            <h3 className="section-title">📅 Your Personalized Study Schedule</h3>
            <div className="schedule-meta">
              <span>⏰ Wake: {schedule.wake_time}</span>
              <span>📚 {schedule.study_sessions} Pomodoro sessions</span>
              <span>🎯 {schedule.technique}</span>
            </div>
            <div className="schedule-timeline">
              {schedule.schedule.map((item, i) => (
                <div key={i} className={`timeline-item type-${item.type}`}>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-time">{item.time}</span>
                    <span className="timeline-activity">{item.activity}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CHALLENGES */}
        {challenges?.length > 0 && (
          <section className="challenges-section">
            <h3 className="section-title">🏆 Health Challenges</h3>
            <div className="challenges-grid">
              {challenges.map(c => (
                <div key={c.id}
                  className={`challenge-card ${completedChallenges.has(c.id) ? "completed" : ""} ${c.priority ? "featured" : ""}`}
                  onClick={() => setCompletedChallenges(prev => {
                    const next = new Set(prev);
                    next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                    return next;
                  })}
                >
                  <div className="challenge-icon">{c.icon}</div>
                  <div className="challenge-info">
                    <p className="challenge-title">{c.title}</p>
                    <p className="challenge-desc">{c.description}</p>
                  </div>
                  <div className="challenge-xp">
                    <span className={completedChallenges.has(c.id) ? "xp-done" : "xp-count"}>
                      {completedChallenges.has(c.id) ? "✓ Done" : `+${c.xp} XP`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACTION BUTTONS */}
        <div className="report-actions">
          <button className="action-btn primary" onClick={() => downloadPDF(data)}>
            📄 Download Report
          </button>
          <button className="action-btn secondary" onClick={() => setShowChat(true)}>
            🤖 Ask AI
          </button>
          {emergency_resources?.show && (
            <button className="action-btn danger" onClick={() => setShowEmergency(true)}>
              🆘 Crisis Support
            </button>
          )}
          <button className="action-btn ghost" onClick={onRetake}>
            🔄 Retake Assessment
          </button>
        </div>

        <p className="disclaimer">
          SynapseGuard is an informational tool, not a medical device. Consult a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
}
