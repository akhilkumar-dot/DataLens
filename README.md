# 🧠 Context-to-Insights Dashboard

An AI-powered web application that transforms raw data files into structured, actionable insights in under 30 seconds.

Upload a CSV, JSON, or log file → receive an AI-generated **summary**, **trend analysis**, **anomaly detection**, and **recommendations** — all rendered on a beautiful interactive dashboard.

![Architecture](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-20-green) ![Python](https://img.shields.io/badge/FastAPI-0.110-teal) ![LLM](https://img.shields.io/badge/LLM-GPT--4o--mini-purple)

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  React UI   │────▶│  Node.js API    │────▶│  Python AI       │
│  (Vite)     │◀────│  (Express)      │◀────│  (FastAPI)       │
│  Port 3000  │     │  Port 4000      │     │  Port 8000       │
└─────────────┘     └────────┬────────┘     └──────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
               ┌────▼────┐     ┌─────▼─────┐
               │ MongoDB │     │   Redis    │
               │  :27017 │     │   :6379    │
               └─────────┘     └───────────┘
```

### Data Flow

1. **Upload** — User drags a file onto the React UI
2. **Parse & Queue** — Node.js validates, parses, stores metadata in MongoDB, enqueues a BullMQ job
3. **Process** — Worker sends parsed data to the Python FastAPI microservice
4. **Analyze** — Python builds a structured prompt, calls the LLM API, validates the JSON response
5. **Render** — React polls for completion and renders insight cards + charts

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- An OpenAI API key (or Gemini/Claude key — configurable)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/context-to-insights.git
cd context-to-insights

# 2. Create .env files
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env

# 3. Add your API key to ai-service/.env
echo "OPENAI_API_KEY=sk-your-key-here" >> ai-service/.env

# 4. Launch everything
docker-compose up --build

# 5. Open http://localhost:3000
```

---

## 📁 Folder Structure

```
/context-to-insights
├── frontend/            # React 18 + Vite + TailwindCSS
│   └── src/
│       ├── components/  # UploadZone, InsightCards, Chart, History
│       └── hooks/       # useJobPolling
├── backend/             # Node.js 20 + Express + BullMQ
│   └── src/
│       ├── models/      # Mongoose schemas
│       ├── routes/      # Upload, Jobs, History endpoints
│       ├── queues/      # BullMQ queue definitions
│       └── workers/     # Job processors
├── ai-service/          # Python 3.11 + FastAPI
│   ├── routers/         # /ai/insights endpoint
│   ├── prompts/         # Prompt construction logic
│   └── parsers/         # LLM output validation (Pydantic)
├── docker-compose.yml
├── sample_data.csv      # Demo dataset
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a data file (CSV/JSON/TXT) |
| `GET` | `/api/jobs/:id` | Get job status and insights |
| `GET` | `/api/history` | Get last 10 processed jobs |
| `POST` | `/ai/insights` | Internal: LLM insight generation |

---

## ⚙️ Configuration

### Backend (`backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://mongo:27017/insights` | MongoDB connection string |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `AI_SERVICE_URL` | `http://ai-service:8000` | Python service URL |
| `PORT` | `4000` | API server port |

### AI Service (`ai-service/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Your OpenAI API key |
| `LLM_MODEL` | `gpt-4o-mini` | Model to use for insights |
| `LLM_TEMPERATURE` | `0.2` | Temperature for generation |

---

## 🧪 Tech Stack Highlights

- **Async Job Queue** — BullMQ (Redis-backed) with exponential backoff retry
- **LLM Pipeline** — Structured prompts → context windowing → schema-validated JSON output
- **Prompt Engineering** — System role + data schema + preview rows + typed instructions
- **Output Parsing** — Pydantic validation with re-prompt on malformed responses
- **Interactive Charts** — Auto-generated Recharts visualizations for numeric columns
- **PDF Export** — One-click download of insights dashboard

---

## 📄 License

MIT
