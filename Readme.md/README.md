# 🧠 SynapseGuard — AI Student Cognitive Health Platform

## Setup

### 1. Backend
```bash
cd backend
pip install -r requirements.txt

# Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."   # Mac/Linux
set ANTHROPIC_API_KEY=sk-ant-...        # Windows CMD

python app.py
# ✅ Running on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Running on http://localhost:3000
```

---

## Features
- ✅ 5-step assessment form (Identity, Sleep, Mind, Body, Habits)
- ✅ AI recommendations via Claude Sonnet
- ✅ AI chatbot (Ask SynapseGuard anything)
- ✅ Animated score reveal rings
- ✅ Weekly trend chart (SVG)
- ✅ Body health heatmap
- ✅ PDF/HTML report download
- ✅ Daily streak system
- ✅ Health challenges with XP
- ✅ Confetti animation (score ≥ 70)
- ✅ Personalized study schedule generator
- ✅ Emergency helplines (depression risk: High)
- ✅ Voice input (Chrome only)
- ✅ Form validation with blink animation
- ✅ Live AQI from Open-Meteo
- ✅ Burnout & depression risk prediction
