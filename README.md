# CarbonTwin AI 🌿

> **See the environmental impact of your future before making a decision.**

CarbonTwin AI is a production-ready, full-stack web application that creates a **Digital Carbon Twin** for every user — a personalized AI model of your lifestyle that enables powerful future impact simulations powered by Google Gemini.

🌍 **[Live Demo: Try CarbonTwin AI on Google Cloud Run](https://carbontwin-ai-610754032582.us-central1.run.app)**

[![CI](https://github.com/AkanshuAich/CarbonTwin-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/AkanshuAich/CarbonTwin-AI/actions)
[![CodeQL](https://github.com/AkanshuAich/CarbonTwin-AI/actions/workflows/codeql.yml/badge.svg)](https://github.com/AkanshuAich/CarbonTwin-AI/actions)

---

## ✨ Hero Feature: Future Impact Explorer

The **Future Impact Explorer** is the flagship feature. Users simulate lifestyle changes and instantly see their environmental impact:

- 🔄 Real-time carbon recalculation as you adjust changes
- 📊 Animated comparison charts (Current vs Future)
- 🌳 Human-friendly equivalencies ("Equivalent to planting 12 trees annually")
- 💾 Save and compare multiple scenarios
- 🤖 AI narrative generation for each scenario

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Next.js 15 App Router (TypeScript)   │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Pages  │ │ API Routes│ │Server Actions│  │
│  └────┬────┘ └─────┬────┘ └──────┬───────┘  │
└───────│─────────────│─────────────│──────────┘
        │             │             │
        ▼             ▼             ▼
┌───────────────────────────────────────────────┐
│                Google Cloud                   │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Firebase │  │ Gemini   │  │ Google Maps │ │
│  │   Auth   │  │   API    │  │  Platform   │ │
│  └──────────┘  └──────────┘  └─────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │Firestore │  │  Cloud   │  │   Secret    │ │
│  │    DB    │  │   Run    │  │   Manager   │ │
│  └──────────┘  └──────────┘  └─────────────┘ │
└───────────────────────────────────────────────┘
```

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🔐 **Auth** | Google Sign-In via Firebase Authentication |
| 🧬 **Carbon Twin** | Multi-step onboarding creates your Digital Carbon Twin |
| 📊 **Dashboard** | Carbon score, category breakdown, monthly trends |
| 🔮 **Future Impact Explorer** | Simulate lifestyle changes with real-time visualization |
| 🤖 **AI Prioritizer** | Gemini-ranked personalized recommendations |
| 💬 **AI Coach** | Streaming sustainability assistant with your Carbon Twin context |
| 🗺️ **Green Routes** | Multi-mode transport emissions comparison |
| 📋 **Weekly Report** | Gemini-generated personalized sustainability reports |

---

## 🛠️ Tech Stack

**Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Recharts  
**Backend**: Next.js API Routes, TypeScript  
**AI**: Google Gemini 1.5 Flash/Pro  
**Auth**: Firebase Authentication (Google Sign-In)  
**Database**: Firestore  
**Maps**: Google Maps Platform  
**Deployment**: Docker + Google Cloud Run  
**Testing**: Jest + React Testing Library + Playwright  

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Firebase project
- Google Cloud project with Gemini API enabled

### 1. Clone & Install

```bash
git clone https://github.com/your-org/carbontwin-ai.git
cd carbontwin-ai
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

Required environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
GEMINI_API_KEY=...           # Server-side only
```

### 3. Deploy Firestore Rules & Indexes

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🐳 Docker Deployment

```bash
# Build production image
docker build -t carbontwin-ai .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=... \
  -e GEMINI_API_KEY=... \
  carbontwin-ai
```

---

## ☁️ Google Cloud Run Deployment

```bash
# 1. Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT/carbontwin-ai

# 2. Deploy to Cloud Run
gcloud run deploy carbontwin-ai \
  --image gcr.io/YOUR_PROJECT/carbontwin-ai \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=... \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest

# 3. View your service
gcloud run services describe carbontwin-ai --region us-central1
```

### Secret Manager Setup

```bash
# Store sensitive keys in Secret Manager
echo -n "your-gemini-key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# E2E tests (requires running dev server)
npm run test:e2e

# E2E tests with UI
npx playwright test --ui
```

### Test Coverage Targets
- Overall: 100%
- Carbon calculator: 100%
- Simulation engine: 100%

---

## 📁 Project Structure

```
carbontwin-ai/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── future-impact/        # Hero Feature ⭐
│   │   ├── ai-coach/
│   │   ├── prioritizer/
│   │   ├── green-routes/
│   │   └── report/
│   ├── api/                      # API Route Handlers
│   │   └── ai/
│   ├── login/
│   └── onboarding/
├── src/
│   ├── features/                 # Feature-based modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── future-impact/
│   │   └── onboarding/
│   ├── lib/                      # Core business logic
│   │   ├── carbon/               # Calculation engine
│   │   └── simulation/           # Scenario engine
│   ├── services/                 # External service clients
│   │   ├── firebase/
│   │   └── gemini/
│   ├── components/               # Shared UI components
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
│   └── tests/                    # Tests
│       ├── unit/
│       └── integration/
├── e2e/                          # Playwright E2E tests
├── .github/                      # CI/CD workflows
├── Dockerfile                    # Production container
├── firestore.rules               # Database security
└── firestore.indexes.json        # Query indexes
```

---

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for full security documentation.

Key security measures:
- **Firestore Rules**: Per-user data isolation, deny-all fallback
- **Input Validation**: Zod schemas on all API routes
- **Input Sanitization**: HTML sanitization on user text
- **CSP Headers**: Strict Content Security Policy
- **Secret Manager**: Server-side secrets never exposed to client
- **Authentication Guards**: Route protection via middleware
- **Non-root Docker**: Container runs as `nextjs` user

---

## ♿ Accessibility

Targeting **WCAG 2.2 AA** compliance:

- Semantic HTML throughout
- ARIA roles, labels, and live regions
- Keyboard navigation support
- Focus management
- Screen reader-friendly chart alternatives
- Sufficient color contrast (verified against WCAG thresholds)
- Reduced motion support via CSS media queries

---

## 🌿 Carbon Calculation Methodology

Emission factors are based on:
- **IPCC Sixth Assessment Report (AR6)** 
- **EPA Greenhouse Gas Emission Factors**
- **UK Government GHG Conversion Factors**

Categories calculated:
1. **Transport**: Mode-specific factors + IPCC-adjusted flight factors (including radiative forcing)
2. **Diet**: Diet-type base + per-meal adjustments + local food savings
3. **Energy**: Grid emission factor × annual kWh ÷ household size
4. **Shopping**: Per-item lifecycle emissions − recycling savings

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- [Google Gemini AI](https://deepmind.google/technologies/gemini/) — AI features
- [Firebase](https://firebase.google.com/) — Auth & database
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Recharts](https://recharts.org/) — Data visualization
- [shadcn/ui](https://ui.shadcn.com/) — Component system
