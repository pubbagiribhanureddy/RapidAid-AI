# 🚨 RapidAid AI — Intelligent Emergency Response System

> **AI for Better Living & Smarter Communities**
>
> Turning scattered emergency reports into verified, location-aware, actionable information.

## 🎯 Problem Statement

During sudden emergencies (road accidents, fires, floods, disasters), emergency responders struggle with:
- **Delayed reporting** — incidents go unreported for critical minutes
- **Inaccurate locations** — callers can't identify exact locations
- **Incomplete details** — missing information about severity, trapped people, hazards
- **Duplicate reports** — hundreds of reports about the same incident
- **No unified overview** — information scattered across channels

## 💡 Solution

RapidAid AI is an AI-powered emergency intelligence platform that:

1. **Collects** emergency reports via a mobile-friendly web interface
2. **Analyzes** reports using NLP to extract key incident details
3. **Groups** duplicate reports about the same incident
4. **Assesses** urgency and highlights critical situations
5. **Maps** incidents on an interactive real-time map
6. **Coordinates** response through an emergency dashboard

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🗣️ Smart Reporting | Text, voice, image, and GPS-based emergency reporting |
| 🌐 Multilingual AI | Supports Telugu and English with AI translation |
| 🔗 Duplicate Detection | Groups related reports using geo-proximity and text similarity |
| ⚡ Priority Assessment | AI-assisted severity scoring with explanations |
| 🗺️ Live Incident Map | Interactive map with real-time incident visualization |
| 📊 Coordination Dashboard | Full incident management for emergency coordinators |

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Maps | Leaflet.js + OpenStreetMap |
| AI | Google Gemini API (simulated for demo) |
| Voice | Web Speech API |
| Icons | Lucide React |

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or pnpm

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open the App
- **Citizen Portal**: http://localhost:5173
- **Live Map**: http://localhost:5173/map
- **Dashboard**: http://localhost:5173/dashboard
- **API Docs**: http://localhost:8000/docs

## 📱 Pages

### Citizen Portal (`/`)
Submit emergency reports with text descriptions, photos, voice messages, and GPS location. The AI assistant analyzes your report and creates a structured incident record.

### Live Incident Map (`/map`)
View all active incidents on an interactive map. Filter by category, severity, and status. Click markers for incident details.

### Coordinator Dashboard (`/dashboard`)
Emergency coordinators can review incidents, verify reports, assign responders, update statuses, and monitor the overall situation.

## 🧪 Demo Scenarios

The app comes pre-loaded with realistic demo incidents:

1. **Road Accident** — Multi-vehicle collision with injury reports
2. **Urban Flooding** — Rising water levels with multiple citizen reports
3. **Building Fire** — Smoke and flames with possible trapped occupants
4. **Building Collapse** — Structural failure with rescue needs
5. **Medical Emergency** — Health crisis requiring immediate response
6. **Gas Leak** — Hazardous material requiring evacuation

## 🔬 Innovation: AI-Powered Incident Correlation

Unlike simple reporting apps, RapidAid AI identifies relationships among reports:

- A report of a flooded road
- An ambulance that can't pass nearby
- Water entering houses on the same street
- A bridge blocked by debris

The system correlates these as a **single developing emergency**, providing coordinators with a unified operational picture.

## ⚠️ Important Notes

- This is a **prototype/hackathon project** — not a replacement for official emergency services
- Demo data uses simulated incidents in the Hyderabad, India area
- AI analysis is simulated for the prototype; designed to integrate with Google Gemini API
- Always call **112** (India) or your local emergency number for real emergencies

## 👥 Target Users

- Citizens reporting emergencies
- Emergency coordinators and dispatchers
- Local authorities and disaster management teams
- First responders and rescue organizations

## 📄 License

Built for educational and demonstration purposes.

---

**RapidAid AI** — *Because every second counts in an emergency.* 🚨
