# 🌿 PackSmart AI

**Intelligent food packaging recommendation system** powered by expert rules, machine learning, and multi-criteria optimization.

PackSmart AI helps farmers, food startups, packaging engineers, and researchers choose the optimal food packaging material based on food properties, storage conditions, and user priorities.

![PackSmart AI](https://img.shields.io/badge/PackSmart_AI-v1.0.0-10B981?style=for-the-badge&logo=leaf&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=flat-square&logo=python&logoColor=white)

---

## ✨ Key Features

### 🎯 Smart Recommendations
- **3-layer AI engine**: Expert rules → ML prediction → Multi-criteria scoring
- **30+ packaging materials** with real OTR, WVTR, cost, and sustainability data
- **45+ food commodities** (fruits, vegetables, grains, spices, dairy, meat, snacks)
- **Confidence scoring** and plain-language reasoning

### 📊 Full Technical Specs
- Barrier performance gauges (OTR/WVTR required vs provided)
- MAP gas composition recommendations
- Shelf-life prediction with Q10 temperature correction
- Respiration modeling for fresh produce
- Feature importance / explainability

### 🌱 Sustainability
- Eco-score (0–100) for every recommendation
- Green alternative suggestions
- Carbon footprint comparison
- Recyclability and biodegradability tracking

### 📱 QR Traceability
- Generate QR codes for batch tracking
- Public scan page with freshness countdown
- Digital product passport
- Printable labels

### 🧪 What-If Simulator
- Change any parameter and see instant re-computation
- Temperature scrubber for shelf-life impact
- Compare scenarios side-by-side

### 🤖 AI Assistant
- Ask follow-up questions about recommendations
- "Why not aluminum foil?" — context-aware answers
- Material comparison explanations

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, shadcn/ui |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2, SQLAlchemy |
| **ML** | scikit-learn (RandomForest), XGBoost/GradientBoosting |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **QR** | qrcode + Pillow (backend), qrcode.react (frontend) |
| **Auth** | JWT with bcrypt password hashing |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Option 1: One-Command Start (Windows)
```bash
# From the project root
run.bat
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
copy .env.example .env
python -m pip install -r requirements.txt
python -m ml.train          # Train ML models (optional, rule engine works without)
python -m uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

### Option 3: Docker Compose
```bash
docker-compose up
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🎮 Demo Scenarios

Three ready-made scenarios accessible from the landing page:

1. **🍓 Fresh Strawberries (Export by Air)**
   - Breathable packaging for high-respiration produce
   - Cold chain at 2°C, 90% RH

2. **🥔 Potato Chips (6-month shelf life)**
   - High-barrier packaging for fatty, crispy snacks
   - Ambient storage, N₂ flush MAP

3. **🌿 Turmeric Powder (Monsoon Storage)**
   - Moisture barrier critical at 85% RH
   - Ambient, tropical climate protection

---

## 📁 Project Structure

```
PackSmart-AI/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI route handlers
│   │   ├── core/          # Config, database, security
│   │   ├── engine/        # Recommendation engine
│   │   │   ├── rules.py   # Expert rule engine
│   │   │   ├── scoring.py # Material scorer
│   │   │   ├── shelf_life.py  # Shelf-life predictor
│   │   │   ├── respiration.py # Fresh produce model
│   │   │   └── recommender.py # Main orchestrator
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic v2 schemas
│   │   └── seed/          # JSON seed data
│   ├── ml/
│   │   ├── train.py       # ML training script
│   │   └── models/        # Saved ML models
│   └── tests/             # Pytest tests
├── frontend/
│   └── src/
│       ├── app/           # Next.js App Router pages
│       ├── components/    # UI components
│       │   ├── ui/        # shadcn/ui primitives
│       │   ├── animated/  # AnimatedNumber, Gauge, etc.
│       │   ├── layout/    # Header, Sidebar, AppShell
│       │   └── features/  # CommandPalette, Assistant, etc.
│       └── lib/           # API client, stores, i18n, motion tokens
├── docker-compose.yml
├── run.bat
└── README.md
```

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, get JWT token |
| `GET` | `/api/commodities` | List all commodities |
| `GET` | `/api/materials` | List all materials |
| `POST` | `/api/recommend` | Get packaging recommendation |
| `POST` | `/api/what-if` | What-if analysis (no save) |
| `POST` | `/api/shelf-life` | Shelf-life prediction only |
| `POST` | `/api/trace` | Create trace batch with QR |
| `GET` | `/api/trace/{hash}` | Public trace info |
| `GET` | `/api/history` | User's analysis history |
| `GET` | `/api/report/{id}/pdf` | Download PDF report |
| `POST` | `/api/batch` | Bulk CSV analysis |
| `GET` | `/api/model/info` | ML model metadata |
| `POST` | `/api/assistant` | Ask AI assistant |

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### ML Model Performance
After training (`python -m ml.train`):
- **Barrier Classifier**: ~99.7% accuracy
- **Material Family Classifier**: ~62% accuracy
- **Shelf Life Regressor**: R² ~0.81

---

## 🎨 Design System

- **Primary**: Forest green (#0F5132 → #10B981)
- **Accent**: Warm amber (#F59E0B)
- **Info**: Teal (#0EA5E9)
- **Danger**: Rose (#E11D48)
- **Neutrals**: Warm stone (#FAFAF9 → #1C1917)
- **Fonts**: Inter (UI), JetBrains Mono (numbers)
- **Radius**: 16px cards, 12px inputs
- **Motion**: Framer Motion with reduced-motion support

---

## 🌐 Internationalization

- English (default)
- Hindi (हिन्दी) — real Devanagari translations
- Extensible i18n system for more languages

---

## ⚠️ Disclaimer

These recommendations are for **decision support only**. Always validate packaging choices with:
- Laboratory shelf-life testing
- Local food safety regulations
- Material supplier specifications
- Commercial trial runs

---

## 📝 License

MIT License

## 👥 Credits

Built for Smart India Hackathon (SIH) 2026.
