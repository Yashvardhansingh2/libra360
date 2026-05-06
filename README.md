# Libra360

Libra360 is a small savings-planning app built for the Dynamicore Strategies technical assessment. It lets a user create a financial goal, tracks progress in the browser, stores data in PostgreSQL, and generates a short financial tip with Gemini when a key is available.

---

## What it includes

| Area | What is implemented |
|---|---|
| React dashboard | Vite + React 18, Recharts, responsive layout |
| Financial goal form | Real-time savings projection chart |
| AI tip | Google Gemini 2.0 Flash through async httpx |
| REST API | FastAPI with async handlers |
| PostgreSQL schema | Normalized tables, check constraints, foreign keys |
| SQL Task | Top-3 users by progress (raw SQL via SQLAlchemy) |
| Dockerfile | Multi-stage build, non-root user |
| AWS architecture | Documented below and in `docs/aws-architecture.md` |

---

## Project Structure

```
libra360/
├── backend/
│   ├── main.py               # FastAPI app + lifespan
│   ├── models/
│   │   ├── database.py       # SQLAlchemy models + engine
│   │   └── schemas.py        # Pydantic v2 schemas
│   ├── routers/
│   │   ├── users.py          # CRUD users
│   │   ├── goals.py          # CRUD goals + AI tip
│   │   └── analytics.py      # Top-3 SQL + summary stats
│   ├── services/
│   │   └── ai_service.py     # Gemini API integration
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Sidebar, StatCard, GoalCard
│   │   ├── pages/            # Dashboard, Goals, NewGoal, Users, Analytics
│   │   └── utils/            # api.js (axios), format.js
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile            # Multi-stage nginx build
│   └── nginx.conf
├── database/
│   └── init.sql              # Schema + seed data + SQL task
├── docs/
│   └── aws-architecture.md   # AWS deployment blueprint
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- (Optional) Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/)

### 1. Clone and configure

```bash
git clone https://github.com/yourusername/libra360.git
cd libra360
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 2. Start everything

```bash
docker compose up --build
```

| Service  | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API      | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### 3. Local development without Docker

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql://... GEMINI_API_KEY=... uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # → http://localhost:3000
```

---

## API Reference

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/` | Create user |
| GET | `/api/users/` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| DELETE | `/api/users/{id}` | Delete user |

### Goals
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/goals/` | Create goal (triggers AI tip) |
| GET | `/api/goals/` | List goals (filter: `?user_id=`) |
| GET | `/api/goals/{id}` | Get goal |
| PATCH | `/api/goals/{id}` | Update savings/contribution |
| DELETE | `/api/goals/{id}` | Delete goal |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/top-users` | Top 3 users closest to goal |
| GET | `/api/analytics/summary` | Dashboard aggregate stats |

---

## Database Schema

```sql
users (
  id SERIAL PK, name VARCHAR(100), email VARCHAR(150) UNIQUE,
  created_at TIMESTAMPTZ
)

savings_goals (
  id SERIAL PK, user_id FK → users,
  title VARCHAR(200), target_amount NUMERIC(14,2) > 0,
  current_savings NUMERIC(14,2) >= 0,
  monthly_contribution NUMERIC(14,2) > 0,
  duration_months INT [1–360],
  category VARCHAR(50), ai_tip TEXT,
  created_at / updated_at TIMESTAMPTZ
)
```

**SQL task — top 3 users closest to goal:**
```sql
SELECT u.name, sg.title, sg.target_amount, sg.current_savings,
       ROUND(sg.current_savings / NULLIF(sg.target_amount,0) * 100, 2) AS progress_percent,
       CEIL((sg.target_amount - sg.current_savings) / NULLIF(sg.monthly_contribution,0))::INT AS months_remaining
FROM savings_goals sg JOIN users u ON u.id = sg.user_id
WHERE sg.current_savings < sg.target_amount
ORDER BY progress_percent DESC LIMIT 3;
```

---

## Security

- **Least privilege**: Backend Docker container runs as non-root `appuser`
- **Input validation**: Pydantic v2 with strict field validators (positive amounts, bounded durations)
- **SQL injection**: SQLAlchemy ORM + parameterized raw queries (`text()` with no string interpolation)
- **CORS**: Restricted to known origins; configurable via env
- **Secrets**: API keys via environment variables, never hardcoded or committed
- **Data integrity**: PostgreSQL CHECK constraints + FK with CASCADE deletes

---

## AWS Architecture

See [`docs/aws-architecture.md`](docs/aws-architecture.md) for full details.

**Summary (Lambda serverless path):**
- Frontend → S3 + CloudFront
- API → API Gateway → Lambda (Mangum adapter for FastAPI)
- DB → RDS PostgreSQL (Multi-AZ)
- AI calls → Lambda → Gemini API
- Secrets → AWS Secrets Manager
- CI/CD → GitHub Actions → ECR → Lambda

---

## Testing the AI Tip

Create a goal via the UI or directly:

```bash
curl -X POST http://localhost:8000/api/goals/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "Emergency Fund",
    "target_amount": 300000,
    "current_savings": 50000,
    "monthly_contribution": 15000,
    "duration_months": 18,
    "category": "Emergency Fund"
  }'
```

If no Gemini key is configured, the app returns a fallback tip instead.

---

Built by Yashvardhan Singh 
