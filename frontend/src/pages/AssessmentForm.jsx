import { useState, useRef } from "react";
import "../styles/form.css";

const STEPS = [
  { id: 1, title: "Identity", icon: "👤", desc: "Tell us about yourself" },
  { id: 2, title: "Sleep", icon: "😴", desc: "Your rest patterns" },
  { id: 3, title: "Mind", icon: "🧠", desc: "Mental wellbeing" },
  { id: 4, title: "Body", icon: "💪", desc: "Physical health" },
  { id: 5, title: "Habits", icon: "⚡", desc: "Daily routines" },
];

const MOODS = [
  { value: "excellent", label: "Excellent", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "neutral", label: "Okay", emoji: "😐" },
  { value: "low", label: "Low", emoji: "😔" },
  { value: "very_low", label: "Very Low", emoji: "😞" },
];

export default function AssessmentForm({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [voiceField, setVoiceField] = useState(null);
  const recognitionRef = useRef(null);

  const [data, setData] = useState({
    name: "", age: "", course: "", year: "",
    sleepHours: 7, sleepQuality: "good", bedtime: "11pm",
    stressLevel: 5, anxietyFrequency: "sometimes", mood: "neutral", focusDuration: 45,
    exerciseFrequency: "sometimes", waterIntake: 6, mealsPerDay: 3,
    screenTime: 4, studyHours: 6, socialConnection: "moderate", caffeine: 2,
  });

  const set = (key, val) => {
    setData((d) => ({ ...d, [key]: val }));
    setErrors((e) => ({ ...e, [key]: false }));
  };

  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!data.name.trim()) newErrors.name = true;
      if (!data.age || data.age < 14 || data.age > 35) newErrors.age = true;
      if (!data.course.trim()) newErrors.course = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < 5) setStep(step + 1);
    else onSubmit(data);
  };

  const startVoice = (fieldName) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser. Try Chrome!");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      set(fieldName, transcript);
      setIsListening(false);
      setVoiceField(null);
    };
    recognition.onerror = () => { setIsListening(false); setVoiceField(null); };
    recognition.onend = () => { setIsListening(false); setVoiceField(null); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setVoiceField(fieldName);
  };

  const progress = ((step - 1) / 4) * 100;

  return (
    <div className="form-page">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-logo">
            <span className="logo-hex">⬡</span>
            <span>SynapseGuard</span>
          </div>
          <div className="form-progress-info">
            <span className="step-counter">Step {step} of 5</span>
            <span className="step-name">{STEPS[step - 1].title}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-wrap">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-steps">
            {STEPS.map((s) => (
              <button
                key={s.id}
                className={`progress-step ${step >= s.id ? "done" : ""} ${step === s.id ? "active" : ""}`}
                onClick={() => s.id < step && setStep(s.id)}
                title={s.title}
              >
                <span className="step-icon">{s.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="form-body">
          <div className="step-heading">
            <span className="step-icon-lg">{STEPS[step - 1].icon}</span>
            <div>
              <h2 className="step-title">{STEPS[step - 1].title}</h2>
              <p className="step-desc">{STEPS[step - 1].desc}</p>
            </div>
          </div>

          <div className="fields-grid">
            {/* STEP 1 — IDENTITY */}
            {step === 1 && <>
              <div className={`field-group ${errors.name ? "error" : ""}`}>
                <label>Full Name
                  <button type="button" className="voice-btn" onClick={() => startVoice("name")}>
                    {isListening && voiceField === "name" ? "🔴 Listening..." : "🎤"}
                  </button>
                </label>
                <input
                  type="text"
                  placeholder="Your name..."
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={errors.name ? "shake" : ""}
                />
                {errors.name && <span className="error-msg">Name is required</span>}
              </div>

              <div className={`field-group ${errors.age ? "error" : ""}`}>
                <label>Age</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={data.age}
                  onChange={(e) => set("age", e.target.value)}
                  min={14} max={35}
                  className={errors.age ? "shake" : ""}
                />
                {errors.age && <span className="error-msg">Valid age (14–35) required</span>}
              </div>

              <div className={`field-group ${errors.course ? "error" : ""}`}>
                <label>Course / Major
                  <button type="button" className="voice-btn" onClick={() => startVoice("course")}>
                    {isListening && voiceField === "course" ? "🔴" : "🎤"}
                  </button>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={data.course}
                  onChange={(e) => set("course", e.target.value)}
                  className={errors.course ? "shake" : ""}
                />
                {errors.course && <span className="error-msg">Course is required</span>}
              </div>

              <div className="field-group">
                <label>Year of Study</label>
                <div className="radio-group">
                  {["1st", "2nd", "3rd", "4th", "5th+"].map((y) => (
                    <button
                      key={y}
                      className={`radio-btn ${data.year === y ? "selected" : ""}`}
                      onClick={() => set("year", y)}
                    >{y}</button>
                  ))}
                </div>
              </div>
            </>}

            {/* STEP 2 — SLEEP */}
            {step === 2 && <>
              <div className="field-group">
                <label>Hours of Sleep Last Night: <span className="value-badge">{data.sleepHours}h</span></label>
                <input type="range" min="2" max="12" step="0.5"
                  value={data.sleepHours} onChange={(e) => set("sleepHours", e.target.value)} />
                <div className="range-labels"><span>2h</span><span>12h</span></div>
              </div>

              <div className="field-group">
                <label>Sleep Quality</label>
                <div className="radio-group">
                  {[{v:"poor",l:"Poor"},{v:"fair",l:"Fair"},{v:"good",l:"Good"},{v:"excellent",l:"Excellent"}].map(q => (
                    <button key={q.v} className={`radio-btn ${data.sleepQuality === q.v ? "selected" : ""}`}
                      onClick={() => set("sleepQuality", q.v)}>{q.l}</button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Usual Bedtime</label>
                <div className="radio-group">
                  {["9pm","10pm","11pm","12am","1am","2am+"].map(t => (
                    <button key={t} className={`radio-btn ${data.bedtime === t ? "selected" : ""}`}
                      onClick={() => set("bedtime", t)}>{t}</button>
                  ))}
                </div>
              </div>
            </>}

            {/* STEP 3 — MIND */}
            {step === 3 && <>
              <div className="field-group">
                <label>Stress Level: <span className="value-badge stress-{Math.round(data.stressLevel/2)}">{data.stressLevel}/10</span></label>
                <input type="range" min="1" max="10"
                  value={data.stressLevel} onChange={(e) => set("stressLevel", parseInt(e.target.value))} />
                <div className="range-labels"><span>😌 Calm</span><span>😰 Max Stress</span></div>
              </div>

              <div className="field-group">
                <label>How often do you feel anxious?</label>
                <div className="radio-group">
                  {[{v:"never",l:"Never"},{v:"rarely",l:"Rarely"},{v:"sometimes",l:"Sometimes"},{v:"often",l:"Often"},{v:"always",l:"Always"}].map(a => (
                    <button key={a.v} className={`radio-btn ${data.anxietyFrequency === a.v ? "selected" : ""}`}
                      onClick={() => set("anxietyFrequency", a.v)}>{a.l}</button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Today's Overall Mood</label>
                <div className="mood-grid">
                  {MOODS.map(m => (
                    <button key={m.value}
                      className={`mood-btn ${data.mood === m.value ? "selected" : ""}`}
                      onClick={() => set("mood", m.value)}>
                      <span className="mood-emoji">{m.emoji}</span>
                      <span className="mood-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Max Focus Duration: <span className="value-badge">{data.focusDuration} min</span></label>
                <input type="range" min="5" max="120" step="5"
                  value={data.focusDuration} onChange={(e) => set("focusDuration", e.target.value)} />
                <div className="range-labels"><span>5 min</span><span>120 min</span></div>
              </div>
            </>}

            {/* STEP 4 — BODY */}
            {step === 4 && <>
              <div className="field-group">
                <label>Exercise Frequency</label>
                <div className="radio-group">
                  {[{v:"never",l:"Never"},{v:"rarely",l:"Rarely"},{v:"sometimes",l:"Sometimes"},{v:"regularly",l:"Regular"},{v:"daily",l:"Daily"}].map(e => (
                    <button key={e.v} className={`radio-btn ${data.exerciseFrequency === e.v ? "selected" : ""}`}
                      onClick={() => set("exerciseFrequency", e.v)}>{e.l}</button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Daily Water Intake: <span className="value-badge">{data.waterIntake} glasses</span></label>
                <input type="range" min="1" max="15"
                  value={data.waterIntake} onChange={(e) => set("waterIntake", parseInt(e.target.value))} />
                <div className="range-labels"><span>1</span><span>15</span></div>
              </div>

              <div className="field-group">
                <label>Meals Per Day: <span className="value-badge">{data.mealsPerDay}</span></label>
                <input type="range" min="1" max="6"
                  value={data.mealsPerDay} onChange={(e) => set("mealsPerDay", parseInt(e.target.value))} />
                <div className="range-labels"><span>1</span><span>6</span></div>
              </div>
            </>}

            {/* STEP 5 — HABITS */}
            {step === 5 && <>
              <div className="field-group">
                <label>Daily Screen Time (non-study): <span className="value-badge">{data.screenTime}h</span></label>
                <input type="range" min="0" max="16" step="0.5"
                  value={data.screenTime} onChange={(e) => set("screenTime", e.target.value)} />
                <div className="range-labels"><span>0h</span><span>16h</span></div>
              </div>

              <div className="field-group">
                <label>Daily Study Hours: <span className="value-badge">{data.studyHours}h</span></label>
                <input type="range" min="0" max="16"
                  value={data.studyHours} onChange={(e) => set("studyHours", parseInt(e.target.value))} />
                <div className="range-labels"><span>0h</span><span>16h</span></div>
              </div>

              <div className="field-group">
                <label>Social Connection Level</label>
                <div className="radio-group">
                  {[{v:"isolated",l:"Isolated"},{v:"low",l:"Low"},{v:"moderate",l:"Moderate"},{v:"high",l:"Strong"}].map(s => (
                    <button key={s.v} className={`radio-btn ${data.socialConnection === s.v ? "selected" : ""}`}
                      onClick={() => set("socialConnection", s.v)}>{s.l}</button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Daily Caffeine Cups: <span className="value-badge">{data.caffeine}</span></label>
                <input type="range" min="0" max="10"
                  value={data.caffeine} onChange={(e) => set("caffeine", parseInt(e.target.value))} />
                <div className="range-labels"><span>0</span><span>10</span></div>
              </div>
            </>}
          </div>
        </div>

        {/* Navigation */}
        <div className="form-nav">
          {step > 1 && (
            <button className="nav-btn secondary" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          <button className="nav-btn primary" onClick={next}>
            {step === 5 ? "🧠 Analyze My Health" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
