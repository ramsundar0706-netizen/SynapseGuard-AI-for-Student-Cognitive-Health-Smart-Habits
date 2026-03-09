import "../styles/report.css";

const SCORE_COLOR = (score) =>
  score >= 75 ? "#00ffb3" : score >= 50 ? "#ffaa00" : "#ff3d6b";

function ScoreRing({ score, label, color }) {
  const r = 40, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#1a2d45" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }} />
        <text x="55" y="51" textAnchor="middle" fill={color}
          fontSize="18" fontWeight="800" fontFamily="Syne,sans-serif">{score}</text>
        <text x="55" y="66" textAnchor="middle" fill="#4a6380" fontSize="9" fontFamily="DM Mono,monospace">/100</text>
      </svg>
      <div className="ring-label">{label}</div>
    </div>
  );
}

function BarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="chart-wrap">
      <div className="chart-title">{title}</div>
      <div className="bar-chart">
        {data.map((d, i) => (
          <div key={i} className="bar-group">
            <div className="bar-track">
              <div className="bar-fill"
                style={{ height: `${(d.value / max) * 100}%`, background: d.color || "#00e5ff" }} />
            </div>
            <div className="bar-label">{d.label}</div>
            <div className="bar-val" style={{ color: d.color || "#00e5ff" }}>{d.value}{d.unit || ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ scores }) {
  const cx = 120, cy = 120, r = 90;
  const N = scores.length;
  const angle = (i) => (i * 2 * Math.PI) / N - Math.PI / 2;
  const point = (i, radius) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = scores.map((s, i) => point(i, (s.value / 100) * r));
  const polyPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <div className="chart-wrap">
      <div className="chart-title">🕸️ Cognitive Radar</div>
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ display: "block", margin: "0 auto" }}>
        {gridLevels.map((lvl, gi) => {
          const pts = scores.map((_, i) => point(i, lvl * r));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
          return <path key={gi} d={path} fill="none" stroke="#1a2d45" strokeWidth="1" />;
        })}
        {scores.map((_, i) => {
          const p = point(i, r);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1a2d45" strokeWidth="1" />;
        })}
        <path d={polyPath} fill="rgba(0,229,255,0.15)" stroke="#00e5ff" strokeWidth="2"
          style={{ filter: "drop-shadow(0 0 6px rgba(0,229,255,0.4))" }} />
        {scores.map((s, i) => {
          const p = point(i, r + 18);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fill="#dce8f5" fontSize="9" fontFamily="DM Mono,monospace">{s.label}</text>
          );
        })}
      </svg>
    </div>
  );
}

export default function ReportPage({ report, onReset }) {
  if (!report) return <div style={{ padding: 40, color: "#fff" }}>No report data.</div>;

  const {
    name, overall_score, scores, aqi_data, recommendations,
    sleep_analysis, habit_analysis, proverb, tip,
    risk_level, depression_risk, graphs
  } = report;

  const scoreColor = SCORE_COLOR(overall_score);

  const barData = graphs?.time_breakdown || [
    { label: "Sleep", value: report.input?.sleepHours || 6, color: "#b388ff", unit: "h" },
    { label: "Study", value: report.input?.studyHours || 4, color: "#00ffb3", unit: "h" },
    { label: "Screen", value: report.input?.screenTime || 5, color: "#ff3d6b", unit: "h" },
    { label: "Social", value: report.input?.socialMediaHours || 2, color: "#ffaa00", unit: "h" },
    { label: "Outdoor", value: report.input?.outdoorTime || 1, color: "#00e5ff", unit: "h" },
  ];

  const radarScores = scores ? [
    { label: "Sleep", value: scores.sleep || 50 },
    { label: "Focus", value: scores.focus || 50 },
    { label: "Stress", value: scores.stress || 50 },
    { label: "Physical", value: scores.physical || 50 },
    { label: "Digital", value: scores.digital || 50 },
    { label: "Mood", value: scores.mood || 50 },
  ] : [];

  return (
    <div className="report-page">
      <div className="report-bg-grid" />
      <div className="report-orb orb1" />
      <div className="report-orb orb2" />

      <header className="report-header">
        <div className="logo">⬡ Synapse<em>Guard</em></div>
        <button className="btn-ghost" onClick={onReset}>← New Assessment</button>
      </header>

      <div className="report-wrapper">

        {/* Hero score */}
        <div className="report-hero">
          <div className="report-name-tag">📋 Cognitive Health Report — {name}</div>
          <div className="hero-scores">
            <div className="overall-score">
              <div className="overall-num" style={{ color: scoreColor }}>{overall_score}</div>
              <div className="overall-label">Overall Score</div>
              <div className="risk-badge" style={{
                background: risk_level === "Low" ? "rgba(0,255,179,0.1)" : risk_level === "Moderate" ? "rgba(255,170,0,0.1)" : "rgba(255,61,107,0.1)",
                color: risk_level === "Low" ? "#00ffb3" : risk_level === "Moderate" ? "#ffaa00" : "#ff3d6b",
                border: `1px solid ${risk_level === "Low" ? "#00ffb350" : risk_level === "Moderate" ? "#ffaa0050" : "#ff3d6b50"}`
              }}>
                {risk_level || "Moderate"} Risk
              </div>
            </div>
            <div className="sub-scores">
              {scores && Object.entries(scores).map(([key, val]) => (
                <ScoreRing key={key} score={val} label={key.charAt(0).toUpperCase() + key.slice(1)} color={SCORE_COLOR(val)} />
              ))}
            </div>
          </div>
        </div>

        {/* AQI + Proverb */}
        <div className="grid-2">
          <div className="info-card aqi-card">
            <div className="info-card-title">🌍 Air Quality — {aqi_data?.city || "Your City"}</div>
            <div className="aqi-num" style={{
              color: (aqi_data?.aqi || 0) <= 50 ? "#00ffb3" : (aqi_data?.aqi || 0) <= 100 ? "#ffaa00" : "#ff3d6b"
            }}>
              AQI {aqi_data?.aqi || "N/A"}
            </div>
            <div className="aqi-status">{aqi_data?.status || "Fetching…"}</div>
            <p className="info-body">{tip || aqi_data?.tip || "Check your city's air quality before outdoor activities."}</p>
          </div>
          <div className="info-card proverb-card">
            <div className="info-card-title">💡 Today's Wisdom</div>
            <blockquote className="proverb">"{proverb || "The mind is everything. What you think, you become. — Buddha"}"</blockquote>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-row">
          <BarChart data={barData} title="📊 Your Daily Time Breakdown" />
          {radarScores.length > 0 && <RadarChart scores={radarScores} />}
        </div>

        {/* Analysis sections */}
        <div className="grid-2">
          <div className="analysis-card">
            <div className="analysis-title">😴 Sleep Analysis</div>
            <div className="analysis-body">
              {sleep_analysis?.map((item, i) => (
                <div key={i} className={`analysis-item ${item.type}`}>
                  <span>{item.type === "warn" ? "⚠️" : item.type === "good" ? "✅" : "💡"}</span>
                  <span>{item.text}</span>
                </div>
              )) || <p style={{ color: "#4a6380" }}>Analysis loading…</p>}
            </div>
          </div>
          <div className="analysis-card">
            <div className="analysis-title">📱 Habit Analysis</div>
            <div className="analysis-body">
              {habit_analysis?.map((item, i) => (
                <div key={i} className={`analysis-item ${item.type}`}>
                  <span>{item.type === "warn" ? "⚠️" : item.type === "good" ? "✅" : "💡"}</span>
                  <span>{item.text}</span>
                </div>
              )) || <p style={{ color: "#4a6380" }}>Analysis loading…</p>}
            </div>
          </div>
        </div>

        {/* Depression risk */}
        {depression_risk && (
          <div className="depression-card">
            <div className="dep-title">🧠 Depression Risk Indicator</div>
            <div className="dep-bar-wrap">
              <div className="dep-bar" style={{
                width: `${depression_risk.score}%`,
                background: depression_risk.score < 30 ? "linear-gradient(90deg,#00ffb3,#00cc88)"
                  : depression_risk.score < 60 ? "linear-gradient(90deg,#ffaa00,#ff6600)"
                  : "linear-gradient(90deg,#ff3d6b,#cc0033)"
              }} />
            </div>
            <div className="dep-labels">
              <span>Low Risk</span>
              <span style={{ color: SCORE_COLOR(100 - depression_risk.score), fontWeight: 700 }}>
                {depression_risk.level} ({depression_risk.score}%)
              </span>
              <span>High Risk</span>
            </div>
            <p className="dep-note">{depression_risk.note}</p>
          </div>
        )}

        {/* Recommendations */}
        <div className="reco-section">
          <div className="reco-title">🚀 Personalised Recommendations</div>
          <div className="reco-grid">
            {recommendations?.map((r, i) => (
              <div key={i} className="reco-card">
                <div className="reco-icon">{r.icon}</div>
                <div className="reco-category">{r.category}</div>
                <div className="reco-text">{r.text}</div>
              </div>
            )) || <p style={{ color: "#4a6380" }}>Generating recommendations…</p>}
          </div>
        </div>

        <div className="report-footer">
          <p>Generated by SynapseGuard AI · Health &amp; Wellbeing Hackathon</p>
          <button className="btn-primary" onClick={() => window.print()}>📄 Download Report</button>
        </div>
      </div>
    </div>
  );
}
