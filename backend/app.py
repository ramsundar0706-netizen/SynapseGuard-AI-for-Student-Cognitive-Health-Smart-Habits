from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# ── AQI fetch ──────────────────────────────────────────────────────────────────
def fetch_aqi(city):
    try:
        import requests
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
        geo_res = requests.get(geo_url, timeout=4).json()
        if not geo_res.get("results"):
            raise Exception("City not found")
        lat = geo_res["results"][0]["latitude"]
        lon = geo_res["results"][0]["longitude"]
        aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&hourly=european_aqi&timezone=auto&forecast_days=1"
        aqi_res = requests.get(aqi_url, timeout=4).json()
        aqi_vals = [v for v in aqi_res.get("hourly", {}).get("european_aqi", []) if v is not None]
        aqi = int(np.mean(aqi_vals[:6])) if aqi_vals else 55
        if aqi <= 20:
            status, tip = "Good", "Air quality is excellent! A 30-min outdoor walk will boost serotonin and improve sleep."
        elif aqi <= 40:
            status, tip = "Fair", "Air quality is fair. Brief outdoor breaks are beneficial for focus restoration."
        elif aqi <= 60:
            status, tip = "Moderate", "Moderate pollution. Limit outdoor exposure if sensitive."
        else:
            status, tip = "Poor", "High pollution. Stay indoors and avoid intense outdoor exercise."
        return {"city": city, "aqi": aqi, "status": status, "tip": tip}
    except Exception as e:
        print(f"AQI error (using fallback): {e}")
        return {"city": city, "aqi": 55, "status": "Moderate", "tip": "Take short outdoor breaks when possible. Fresh air improves concentration."}

# ── Scoring ────────────────────────────────────────────────────────────────────
def score_sleep(d):
    score = 100
    hours = float(d.get("sleepHours", 7))
    quality = int(d.get("sleepQuality", 2))
    wakeups = int(d.get("wakeUps", 1))
    if hours < 5: score -= 40
    elif hours < 6: score -= 25
    elif hours < 7: score -= 10
    elif hours > 10: score -= 15
    score -= (4 - quality) * 8
    score -= min(wakeups * 5, 25)
    return max(0, min(100, int(score)))

def score_stress(d):
    stress = int(d.get("stressLevel", 2))
    anxiety = int(d.get("anxietyDays", 3))
    score = 100 - (stress * 18) - (anxiety * 3)
    return max(0, min(100, int(score)))

def score_focus(d):
    focus = int(d.get("focusLevel", 2))
    screen = float(d.get("screenTime", 5))
    social = float(d.get("socialMediaHours", 2))
    breaks = int(d.get("breakFrequency", 2))
    score = (focus / 4) * 60
    score -= max(0, screen - 6) * 3
    score -= social * 3
    score += breaks * 6
    return max(0, min(100, int(score)))

def score_physical(d):
    water = int(d.get("waterIntake", 4))
    exercise = int(d.get("exerciseFreq", 2))
    diet = int(d.get("dietQuality", 2))
    outdoor = float(d.get("outdoorTime", 1))
    score = min(water / 8 * 35, 35)
    score += (exercise / 4) * 30
    score += (diet / 4) * 25
    score += min(outdoor / 2 * 10, 10)
    return max(0, min(100, int(score)))

def score_digital(d):
    screen = float(d.get("screenTime", 5))
    social = float(d.get("socialMediaHours", 2))
    study = float(d.get("studyHours", 4))
    breaks = int(d.get("breakFrequency", 2))
    score = 100
    score -= max(0, screen - 4) * 5
    score -= max(0, social - 1) * 6
    score += min(study * 3, 20)
    score += breaks * 4
    return max(0, min(100, int(score)))

def score_mood(d):
    mood = int(d.get("mood", 2))
    symptoms = d.get("symptoms", [])
    score = (mood / 4) * 80
    score -= len(symptoms) * 3
    return max(0, min(100, int(score)))

def calc_depression_risk(d, scores):
    risk = 0
    if float(d.get("sleepHours", 7)) < 6: risk += 20
    if int(d.get("stressLevel", 2)) >= 3: risk += 20
    if int(d.get("mood", 2)) <= 1: risk += 25
    if int(d.get("anxietyDays", 3)) >= 8: risk += 20
    risk += min(len(d.get("symptoms", [])) * 4, 20)
    risk = min(risk, 100)
    if risk < 25: level, note = "Low", "Your mental health indicators look positive. Keep maintaining your healthy habits!"
    elif risk < 50: level, note = "Moderate", "Some risk factors detected. Prioritise sleep, reduce screen time, and try mindfulness."
    elif risk < 75: level, note = "Elevated", "Multiple risk factors present. Consider speaking with a counsellor or trusted person."
    else: level, note = "High", "Significant risk indicators. Please reach out to a mental health professional today."
    return {"score": risk, "level": level, "note": note}

def analyse_sleep(d):
    results = []
    hours = float(d.get("sleepHours", 7))
    quality = int(d.get("sleepQuality", 2))
    wakeups = int(d.get("wakeUps", 1))
    if hours < 6:
        results.append({"type": "warn", "text": f"Only {hours}h of sleep. Students need 7-9h. Cognitive function drops 30% below 6h."})
    else:
        results.append({"type": "good", "text": f"{hours}h sleep is within healthy range. Memory consolidation cycles are completing well."})
    if quality <= 1:
        results.append({"type": "warn", "text": "Poor sleep quality. Avoid screens 1h before bed and keep bedroom at 18-20 degrees."})
    elif quality >= 3:
        results.append({"type": "good", "text": "Good sleep quality! Deep sleep is essential for learning retention and mood regulation."})
    if wakeups >= 3:
        results.append({"type": "warn", "text": f"{wakeups} night wake-ups disrupts REM cycles. Reduce evening caffeine and try 4-7-8 breathing."})
    results.append({"type": "info", "text": "Sleep repair tip: Shift bedtime 15 min earlier each week for lasting improvement."})
    return results

def analyse_habits(d):
    results = []
    screen = float(d.get("screenTime", 5))
    social = float(d.get("socialMediaHours", 2))
    breaks = int(d.get("breakFrequency", 2))
    study = float(d.get("studyHours", 4))
    if screen > 8:
        results.append({"type": "warn", "text": f"{screen}h screen time causes eye strain, melatonin suppression and dopamine dysregulation."})
    else:
        results.append({"type": "good", "text": f"Screen time of {screen}h is manageable. Keep blue light exposure low after 8pm."})
    if social > 3:
        results.append({"type": "warn", "text": f"{social}h social media exceeds recommended 1-2h. Linked to anxiety and reduced attention span."})
    if breaks <= 1:
        results.append({"type": "warn", "text": "Infrequent study breaks detected. Use Pomodoro: 25 min focus + 5 min break."})
    elif breaks >= 4:
        results.append({"type": "good", "text": "Excellent break frequency! Spaced rest improves information encoding by up to 40%."})
    if study >= 6:
        results.append({"type": "info", "text": f"Studying {study}h/day is intense. Ensure deep work, not passive reading. Use active recall."})
    return results

def get_recommendations(d, scores):
    recos = []
    if scores["sleep"] < 60:
        recos.append({"icon": "😴", "category": "Sleep Repair", "text": "Set a consistent bedtime. Aim for 7-8h. Keep room dark, cool and phone-free."})
    if scores["focus"] < 60:
        recos.append({"icon": "🎯", "category": "Focus Booster", "text": "Try Pomodoro Technique: 25 min deep work + 5 min break. Block distracting apps."})
    if scores["stress"] < 60:
        recos.append({"icon": "🧘", "category": "Stress Relief", "text": "Practice 4-7-8 breathing daily. Journal for 5 min before bed to clear your mind."})
    if int(d.get("waterIntake", 4)) < 6:
        recos.append({"icon": "💧", "category": "Hydration", "text": "Drink at least 8 glasses of water daily. Dehydration reduces cognition by 20%."})
    if int(d.get("exerciseFreq", 2)) <= 1:
        recos.append({"icon": "🏃", "category": "Movement", "text": "Even 20-min walks boost BDNF brain growth factor. Start with 3x per week."})
    if float(d.get("socialMediaHours", 2)) > 2:
        recos.append({"icon": "📵", "category": "Digital Detox", "text": "Use Focus Mode on phone during study and 1h before sleep. Limit to 2h/day."})
    if int(d.get("dietQuality", 2)) <= 1:
        recos.append({"icon": "🥗", "category": "Brain Diet", "text": "Add omega-3 rich foods like walnuts and fish. Avoid sugar spikes before study."})
    recos.append({"icon": "☀️", "category": "Morning Routine", "text": "10 min sunlight within 30 min of waking resets your circadian rhythm."})
    recos.append({"icon": "📚", "category": "Study Method", "text": "Use active recall and spaced repetition instead of passive re-reading."})
    return recos

PROVERBS = [
    "The mind is everything. What you think, you become. - Buddha",
    "Take care of your body. It is the only place you have to live. - Jim Rohn",
    "Sleep is the best meditation. - Dalai Lama",
    "An investment in knowledge pays the best interest. - Benjamin Franklin",
    "He who has health has hope; and he who has hope has everything. - Arabian Proverb",
    "Early to bed and early to rise makes a man healthy, wealthy and wise. - Franklin",
]

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.route("/analyze", methods=["POST", "OPTIONS"])
def analyze():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        d = request.get_json(force=True)
        print(f"Received data for: {d.get('name', 'Unknown')}")

        scores = {
            "sleep":    score_sleep(d),
            "focus":    score_focus(d),
            "stress":   score_stress(d),
            "physical": score_physical(d),
            "digital":  score_digital(d),
            "mood":     score_mood(d),
        }

        overall = int(np.mean(list(scores.values())))
        risk = "Low" if overall >= 70 else "Moderate" if overall >= 45 else "High"
        aqi_data = fetch_aqi(d.get("city", "Chennai"))

        result = {
            "name": str(d.get("name", "Student")),
            "overall_score": overall,
            "risk_level": risk,
            "scores": scores,
            "aqi_data": aqi_data,
            "sleep_analysis": analyse_sleep(d),
            "habit_analysis": analyse_habits(d),
            "depression_risk": calc_depression_risk(d, scores),
            "recommendations": get_recommendations(d, scores),
            "proverb": random.choice(PROVERBS),
            "tip": aqi_data.get("tip", ""),
            "input": d,
            "generated_at": datetime.now().isoformat(),
        }
        print(f"Analysis complete. Score: {overall}")
        return jsonify(result)

    except Exception as e:
        print(f"ERROR in /analyze: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "SynapseGuard backend running", "version": "1.0.0"})

if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")