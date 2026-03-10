from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
import anthropic
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# ─── IN-MEMORY STORAGE (replace with DB in production) ────────────────────────
user_sessions = {}
streak_data = {}
weekly_history = []

# ─── SCORING ENGINE ────────────────────────────────────────────────────────────
def calculate_score(data):
    score = 100
    flags = []

    # Sleep scoring
    sleep_hours = float(data.get("sleepHours", 7))
    sleep_quality = data.get("sleepQuality", "good")
    if sleep_hours < 5:
        score -= 20
        flags.append("critical_sleep")
    elif sleep_hours < 6:
        score -= 12
        flags.append("low_sleep")
    elif sleep_hours > 9:
        score -= 5

    quality_map = {"poor": -15, "fair": -8, "good": 0, "excellent": 5}
    score += quality_map.get(sleep_quality, 0)

    # Mental health scoring
    stress_level = int(data.get("stressLevel", 5))
    anxiety_freq = data.get("anxietyFrequency", "sometimes")
    mood = data.get("mood", "neutral")

    score -= stress_level * 2

    anxiety_map = {"never": 5, "rarely": 0, "sometimes": -8, "often": -15, "always": -25}
    score += anxiety_map.get(anxiety_freq, 0)

    mood_map = {"excellent": 10, "good": 5, "neutral": 0, "low": -10, "very_low": -20}
    score += mood_map.get(mood, 0)

    if stress_level >= 8:
        flags.append("high_stress")
    if anxiety_freq in ["often", "always"]:
        flags.append("high_anxiety")
    if mood in ["low", "very_low"]:
        flags.append("low_mood")

    # Physical scoring
    exercise_freq = data.get("exerciseFrequency", "sometimes")
    exercise_map = {"never": -15, "rarely": -8, "sometimes": 0, "regularly": 10, "daily": 15}
    score += exercise_map.get(exercise_freq, 0)

    water_intake = int(data.get("waterIntake", 6))
    if water_intake < 4:
        score -= 10
        flags.append("dehydration_risk")
    elif water_intake >= 8:
        score += 5

    # Habits scoring
    screen_time = float(data.get("screenTime", 4))
    study_hours = float(data.get("studyHours", 4))
    social_connection = data.get("socialConnection", "moderate")

    if screen_time > 8:
        score -= 12
        flags.append("excessive_screen")
    elif screen_time > 6:
        score -= 6

    if study_hours > 10:
        score -= 10
        flags.append("study_overload")

    social_map = {"isolated": -15, "low": -8, "moderate": 0, "high": 8}
    score += social_map.get(social_connection, 0)

    # Clamp score
    score = max(0, min(100, score))

    # Burnout prediction
    burnout_risk = "Low"
    if score < 40 or len([f for f in flags if f in ["high_stress", "critical_sleep", "study_overload"]]) >= 2:
        burnout_risk = "High"
        flags.append("burnout_risk")
    elif score < 60 or len(flags) >= 3:
        burnout_risk = "Moderate"

    # Depression risk
    depression_risk = "Low"
    depression_indicators = ["low_mood", "high_anxiety", "critical_sleep", "isolated"]
    if sum(1 for f in flags if f in depression_indicators) >= 3:
        depression_risk = "High"
    elif sum(1 for f in flags if f in depression_indicators) >= 2:
        depression_risk = "Moderate"

    return {
        "overall": round(score),
        "sleep": max(0, min(100, 100 - abs(sleep_hours - 7.5) * 12 + quality_map.get(sleep_quality, 0))),
        "mental": max(0, min(100, 100 - stress_level * 5 + anxiety_map.get(anxiety_freq, 0) + mood_map.get(mood, 0))),
        "physical": max(0, min(100, 60 + exercise_map.get(exercise_freq, 0) + (water_intake - 4) * 3)),
        "habits": max(0, min(100, 80 - max(0, screen_time - 4) * 5 - max(0, study_hours - 6) * 4)),
        "flags": flags,
        "burnout_risk": burnout_risk,
        "depression_risk": depression_risk
    }

# ─── ROUTES ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})


@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        scores = calculate_score(data)
        
        # Get AQI data
        aqi_data = get_aqi(data.get("latitude", 28.6), data.get("longitude", 77.2))
        
        # Generate AI recommendations via Claude
        recommendations = generate_ai_recommendations(data, scores)
        
        # Generate study schedule
        schedule = generate_study_schedule(data)
        
        # Store for weekly history
        entry = {
            "date": datetime.now().isoformat(),
            "scores": scores,
            "name": data.get("name", "Student")
        }
        weekly_history.append(entry)
        if len(weekly_history) > 7:
            weekly_history.pop(0)

        # Update streak
        user_id = data.get("name", "default").lower().replace(" ", "_")
        update_streak(user_id)

        return jsonify({
            "success": True,
            "scores": scores,
            "aqi": aqi_data,
            "recommendations": recommendations,
            "schedule": schedule,
            "streak": streak_data.get(user_id, {}).get("count", 1),
            "weekly_history": weekly_history[-7:],
            "emergency_resources": get_emergency_resources(scores),
            "challenges": generate_challenges(scores),
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Error in /api/analyze: {e}")
        return jsonify({"error": str(e), "success": False}), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        body = request.get_json()
        messages = body.get("messages", [])
        context = body.get("context", {})

        system_prompt = f"""You are SynapseGuard AI, a compassionate and expert cognitive health assistant for students. 
        You provide evidence-based advice on mental health, study habits, sleep, stress management, and academic wellbeing.
        
        Current user context: {json.dumps(context)}
        
        Be warm, supportive, concise (2-3 paragraphs max), and always recommend professional help for serious concerns.
        Use emojis sparingly. Never diagnose. Always be encouraging."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system_prompt,
            messages=messages
        )

        return jsonify({
            "reply": response.content[0].text,
            "success": True
        })

    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"error": str(e), "success": False}), 500


@app.route("/api/weekly", methods=["GET"])
def weekly():
    # Generate demo weekly data if empty
    if len(weekly_history) < 3:
        base = 65
        demo = []
        for i in range(7):
            date = datetime.now() - timedelta(days=6-i)
            demo.append({
                "date": date.strftime("%a"),
                "overall": max(30, min(95, base + random.randint(-10, 10))),
                "sleep": max(30, min(95, base + random.randint(-15, 15))),
                "mental": max(30, min(95, base + random.randint(-12, 12))),
            })
            base = demo[-1]["overall"]
        return jsonify({"data": demo})
    
    return jsonify({"data": [
        {
            "date": datetime.fromisoformat(h["date"]).strftime("%a"),
            "overall": h["scores"]["overall"],
            "sleep": h["scores"]["sleep"],
            "mental": h["scores"]["mental"]
        } for h in weekly_history
    ]})


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def get_aqi(lat=28.6, lon=77.2):
    try:
        url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm2_5,pm10"
        r = requests.get(url, timeout=5)
        d = r.json()
        aqi = d.get("current", {}).get("us_aqi", 75)
        pm25 = d.get("current", {}).get("pm2_5", 15)
        
        if aqi <= 50: label, color = "Good", "#00e676"
        elif aqi <= 100: label, color = "Moderate", "#ffea00"
        elif aqi <= 150: label, color = "Unhealthy for Sensitive", "#ff9100"
        elif aqi <= 200: label, color = "Unhealthy", "#f44336"
        else: label, color = "Very Unhealthy", "#9c27b0"
        
        return {"aqi": aqi, "pm25": round(pm25, 1), "label": label, "color": color}
    except:
        return {"aqi": 75, "pm25": 12.5, "label": "Moderate", "color": "#ffea00"}


def generate_ai_recommendations(data, scores):
    try:
        prompt = f"""Student health data: {json.dumps(data)}
Health scores: {json.dumps(scores)}

Generate exactly 5 personalized, actionable recommendations as a JSON array. Each item:
{{"category": "Sleep|Mental|Physical|Habits|Nutrition", "priority": "high|medium|low", "title": "short title", "tip": "2-sentence actionable advice", "emoji": "relevant emoji"}}

Return ONLY valid JSON array, no markdown."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )
        
        text = response.content[0].text.strip()
        # Clean JSON
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"AI rec error: {e}")
        return get_fallback_recommendations(scores)


def get_fallback_recommendations(scores):
    recs = []
    if scores["sleep"] < 60:
        recs.append({"category": "Sleep", "priority": "high", "title": "Fix Your Sleep Schedule",
                     "tip": "Aim for 7-9 hours by sleeping and waking at consistent times. Avoid screens 1 hour before bed.", "emoji": "😴"})
    if scores["mental"] < 60:
        recs.append({"category": "Mental", "priority": "high", "title": "Stress Reset Protocol",
                     "tip": "Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Do this 3x when stressed.", "emoji": "🧘"})
    if scores["physical"] < 60:
        recs.append({"category": "Physical", "priority": "medium", "title": "Move More",
                     "tip": "Even 20 minutes of brisk walking daily boosts cognition by 30%. Start tomorrow morning.", "emoji": "🏃"})
    recs.append({"category": "Habits", "priority": "medium", "title": "Hydration Challenge",
                 "tip": "Drink 8 glasses of water daily. Dehydration reduces focus by up to 20%.", "emoji": "💧"})
    recs.append({"category": "Nutrition", "priority": "low", "title": "Brain Foods",
                 "tip": "Add walnuts, blueberries, and dark chocolate to your diet for enhanced memory and mood.", "emoji": "🫐"})
    return recs[:5]


def generate_study_schedule(data):
    study_hours = float(data.get("studyHours", 6))
    sleep_hours = float(data.get("sleepHours", 7))
    
    # Pomodoro-based schedule
    sessions = min(8, int(study_hours * 60 / 25))
    wake_time = 6 if sleep_hours >= 7 else 7
    
    return {
        "wake_time": f"{wake_time}:00 AM",
        "study_sessions": sessions,
        "technique": "Pomodoro (25 min focus + 5 min break)",
        "schedule": [
            {"time": "6:00-6:30", "activity": "Morning routine + hydration", "type": "wellness"},
            {"time": "6:30-8:00", "activity": "Deep focus study block (peak cognition)", "type": "study"},
            {"time": "8:00-9:00", "activity": "Breakfast + light walk", "type": "break"},
            {"time": "9:00-12:00", "activity": "Core study sessions (Pomodoro)", "type": "study"},
            {"time": "12:00-1:00", "activity": "Lunch + power nap (20 min)", "type": "break"},
            {"time": "1:00-4:00", "activity": "Review & practice problems", "type": "study"},
            {"time": "4:00-5:00", "activity": "Exercise / outdoor time", "type": "wellness"},
            {"time": "5:00-7:00", "activity": "Light review + reading", "type": "study"},
            {"time": "7:00-9:00", "activity": "Dinner + relaxation", "type": "break"},
            {"time": "9:00-10:00", "activity": "Wind-down routine (no screens)", "type": "wellness"},
            {"time": f"{wake_time + int(sleep_hours)}:00", "activity": "Sleep (non-negotiable!)", "type": "sleep"}
        ]
    }


def generate_challenges(scores):
    challenges = [
        {"id": 1, "title": "7-Day Sleep Warrior", "description": "Sleep 7+ hours for 7 consecutive days", "xp": 500, "icon": "🌙"},
        {"id": 2, "title": "Hydration Hero", "description": "Drink 8 glasses of water daily for 5 days", "xp": 300, "icon": "💧"},
        {"id": 3, "title": "Mindful Minutes", "description": "Meditate for 10 minutes each day this week", "xp": 400, "icon": "🧘"},
        {"id": 4, "title": "Movement Master", "description": "Exercise for 30 minutes, 4 times this week", "xp": 450, "icon": "🏃"},
        {"id": 5, "title": "Screen Detox", "description": "No screens after 10 PM for 5 days", "xp": 350, "icon": "📵"},
    ]
    # Prioritize challenges based on weak scores
    if scores["sleep"] < 60:
        challenges[0]["priority"] = True
    if scores["physical"] < 60:
        challenges[3]["priority"] = True
    return challenges


def get_emergency_resources(scores):
    if scores.get("depression_risk") == "High" or scores["overall"] < 35:
        return {
            "show": True,
            "message": "Your responses suggest you may be going through a difficult time. Please reach out — you're not alone.",
            "resources": [
                {"name": "iCall (India)", "number": "9152987821", "available": "Mon-Sat, 8am-10pm"},
                {"name": "Vandrevala Foundation", "number": "1860-2662-345", "available": "24/7"},
                {"name": "NIMHANS Helpline", "number": "080-46110007", "available": "24/7"},
                {"name": "Crisis Text Line", "number": "Text HOME to 741741", "available": "24/7"},
            ]
        }
    return {"show": False}


def update_streak(user_id):
    today = datetime.now().date().isoformat()
    if user_id not in streak_data:
        streak_data[user_id] = {"count": 1, "last_date": today}
    else:
        last = streak_data[user_id]["last_date"]
        yesterday = (datetime.now().date() - timedelta(days=1)).isoformat()
        if last == yesterday:
            streak_data[user_id]["count"] += 1
        elif last != today:
            streak_data[user_id]["count"] = 1
        streak_data[user_id]["last_date"] = today


if __name__ == "__main__":
    app.run(debug=True, port=5000)