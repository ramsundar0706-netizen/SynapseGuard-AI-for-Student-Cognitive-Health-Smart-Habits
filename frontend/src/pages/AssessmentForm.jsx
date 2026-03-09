import { useState } from "react";
import "../styles/form.css";

const STEPS = [
  { id: 1, label: "Identity", icon: "👤" },
  { id: 2, label: "Sleep", icon: "😴" },
  { id: 3, label: "Mind", icon: "🧠" },
  { id: 4, label: "Body", icon: "💪" },
  { id: 5, label: "Habits", icon: "📱" },
];

const MOODS = ["😔 Depressed", "😟 Anxious", "😐 Neutral", "🙂 Good", "😄 Excellent"];
const STRESS = ["Very Low", "Low", "Moderate", "High", "Extreme"];
const FOCUS  = ["Can't focus", "Easily distracted", "Moderate", "Sharp", "Hyper-focused"];
const DIET   = ["Very Poor", "Poor", "Average", "Good", "Excellent"];
const EXERCISE_FREQ = ["Never", "1x / week", "2–3x / week", "4–5x / week", "Daily"];

function SliderField({ label, value, min, max, step = 1, unit, onChange, leftLabel, rightLabel, color = "#00e5ff" }) {
  return (
    <div className="field">
      <label>{label} <span className="field-val" style={{ color }}>{value}{unit}</span></label>
      <input type="range" min={min} max={max} step={step}
        value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ "--fill": color }} />
      <div className="slider-ends">
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  );
}

function ChipField({ label, options, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="chips">
        {options.map((opt, i) => (
          <button key={i} type="button"
            className={`chip ${value === i ? "selected" : ""}`}
            onClick={() => onChange(i)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AssessmentForm({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: "", age: "", city: "",
    sleepHours: 6, sleepQuality: 2, wakeUps: 1, sleepTime: "23:00", wakeTime: "06:00",
    mood: 2, stressLevel: 2, focusLevel: 2, anxietyDays: 3,
    waterIntake: 4, exerciseFreq: 2, dietQuality: 2, outdoorTime: 1,
    screenTime: 5, socialMediaHours: 2, studyHours: 4, breakFrequency: 2,
    symptoms: [],
  });

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const toggleSymptom = (sym) => {
    setData(d => {
      const arr = d.symptoms.includes(sym)
        ? d.symptoms.filter(s => s !== sym)
        : [...d.symptoms, sym];
      return { ...d, symptoms: arr };
    });
  };

  const symptoms = [
    "Headaches", "Eye strain", "Fatigue", "Brain fog",
    "Irritability", "Insomnia", "Low motivation", "Memory lapses",
    "Neck/shoulder pain", "Appetite changes"
  ];

  const next = () => setStep(s => Math.min(s + 1, 5));
  const prev = () => setStep(s => Math.max(s - 1, 1));
  const submit = () => onSubmit(data);

  return (
    <div className="form-page">
      <div className="form-bg-grid" />

      {/* Header */}
      <header className="form-header">
        <div className="logo">⬡ Synapse<em>Guard</em></div>
        <div className="header-pill">Cognitive Assessment</div>
      </header>

      <div className="form-wrapper">

        {/* Step indicator */}
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div className={`step ${step === s.id ? "active" : step > s.id ? "done" : ""}`}>
                <div className="step-dot">{step > s.id ? "✓" : s.icon}</div>
                <div className="step-label">{s.label}</div>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${step > s.id ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="form-card">

          {/* STEP 1 — Identity */}
          {step === 1 && (
            <>
              <div className="card-title"><span className="card-icon">👤</span> About You</div>
              <p className="card-sub">Basic info to personalise your report</p>
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Arjun Sharma"
                  value={data.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Age</label>
                  <input type="number" min={10} max={100} placeholder="e.g. 20"
                    value={data.age} onChange={e => set("age", e.target.value)} />
                </div>
                <div className="field">
                  <label>City <span style={{fontSize:11,color:"var(--muted)"}}>— for AQI lookup</span></label>
                  <input type="text" placeholder="e.g. Chennai"
                    value={data.city} onChange={e => set("city", e.target.value)} />
                </div>
              </div>
              <ChipField label="How do you feel today overall?"
                options={MOODS} value={data.mood} onChange={v => set("mood", v)} />
            </>
          )}

          {/* STEP 2 — Sleep */}
          {step === 2 && (
            <>
              <div className="card-title"><span className="card-icon">😴</span> Sleep Patterns</div>
              <p className="card-sub">Sleep is the #1 driver of cognitive health</p>
              <SliderField label="Hours of sleep last night"
                value={data.sleepHours} min={0} max={12} step={0.5} unit="h"
                leftLabel="0h" rightLabel="12h"
                onChange={v => set("sleepHours", v)} color="#b388ff" />
              <ChipField label="Sleep quality"
                options={["😖 Terrible", "😕 Poor", "😐 Okay", "😊 Good", "😌 Deep"]}
                value={data.sleepQuality} onChange={v => set("sleepQuality", v)} />
              <SliderField label="Times you woke up during night"
                value={data.wakeUps} min={0} max={10} unit="x"
                leftLabel="0" rightLabel="10+"
                onChange={v => set("wakeUps", v)} color="#ff3d6b" />
              <div className="grid-2">
                <div className="field">
                  <label>Usual Bedtime</label>
                  <input type="time" value={data.sleepTime}
                    onChange={e => set("sleepTime", e.target.value)} />
                </div>
                <div className="field">
                  <label>Usual Wake Time</label>
                  <input type="time" value={data.wakeTime}
                    onChange={e => set("wakeTime", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* STEP 3 — Mind */}
          {step === 3 && (
            <>
              <div className="card-title"><span className="card-icon">🧠</span> Mental State</div>
              <p className="card-sub">Cognitive performance &amp; emotional wellbeing</p>
              <ChipField label="Stress level today"
                options={STRESS} value={data.stressLevel} onChange={v => set("stressLevel", v)} />
              <ChipField label="Focus &amp; concentration ability"
                options={FOCUS} value={data.focusLevel} onChange={v => set("focusLevel", v)} />
              <SliderField label="Anxious / low-mood days in last 2 weeks"
                value={data.anxietyDays} min={0} max={14} unit=" days"
                leftLabel="0" rightLabel="14"
                onChange={v => set("anxietyDays", v)} color="#ffaa00" />
              <div className="field">
                <label>Symptoms you've noticed</label>
                <div className="chips">
                  {symptoms.map(s => (
                    <button key={s} type="button"
                      className={`chip ${data.symptoms.includes(s) ? "selected" : ""}`}
                      onClick={() => toggleSymptom(s)}>{s}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STEP 4 — Body */}
          {step === 4 && (
            <>
              <div className="card-title"><span className="card-icon">💪</span> Physical Health</div>
              <p className="card-sub">Body and brain are deeply connected</p>
              <SliderField label="Glasses of water per day"
                value={data.waterIntake} min={0} max={15} unit=" glasses"
                leftLabel="0" rightLabel="15"
                onChange={v => set("waterIntake", v)} color="#00ffb3" />
              <ChipField label="Exercise frequency"
                options={EXERCISE_FREQ} value={data.exerciseFreq} onChange={v => set("exerciseFreq", v)} />
              <ChipField label="Diet quality"
                options={DIET} value={data.dietQuality} onChange={v => set("dietQuality", v)} />
              <SliderField label="Hours spent outdoors per day"
                value={data.outdoorTime} min={0} max={10} step={0.5} unit="h"
                leftLabel="0h" rightLabel="10h"
                onChange={v => set("outdoorTime", v)} color="#00e5ff" />
            </>
          )}

          {/* STEP 5 — Habits */}
          {step === 5 && (
            <>
              <div className="card-title"><span className="card-icon">📱</span> Digital &amp; Study Habits</div>
              <p className="card-sub">Screen time &amp; study patterns impact cognition heavily</p>
              <SliderField label="Total screen time per day"
                value={data.screenTime} min={0} max={18} step={0.5} unit="h"
                leftLabel="0h" rightLabel="18h"
                onChange={v => set("screenTime", v)} color="#ff3d6b" />
              <SliderField label="Social media usage"
                value={data.socialMediaHours} min={0} max={12} step={0.5} unit="h"
                leftLabel="0h" rightLabel="12h"
                onChange={v => set("socialMediaHours", v)} color="#ffaa00" />
              <SliderField label="Study / focused work hours"
                value={data.studyHours} min={0} max={16} step={0.5} unit="h"
                leftLabel="0h" rightLabel="16h"
                onChange={v => set("studyHours", v)} color="#00ffb3" />
              <ChipField label="How often do you take breaks while studying?"
                options={["Never", "Rarely", "Sometimes", "Hourly", "Every 25 min (Pomodoro)"]}
                value={data.breakFrequency} onChange={v => set("breakFrequency", v)} />
            </>
          )}

          {/* Navigation */}
          <div className="form-nav">
            {step > 1
              ? <button type="button" className="btn-ghost" onClick={prev}>← Back</button>
              : <div />}
            {step < 5
              ? <button type="button" className="btn-primary" onClick={next}>Continue →</button>
              : <button type="button" className="btn-primary btn-submit" onClick={submit}>
                  🧠 Analyse My Health
                </button>}
          </div>

          <div className="step-counter">Step {step} of 5</div>
        </div>
      </div>
    </div>
  );
}
