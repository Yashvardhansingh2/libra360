# AWS Architecture — Libra360

## Overview

This document outlines two deployment paths. **Option A (Lambda)** is the simpler starting point for an MVP with variable traffic. **Option B (EC2/ECS)** is better if the app needs steadier throughput or long-lived connections.

---

## Option A: Serverless (recommended for MVP)

```
User Browser
     │
     ▼
┌─────────────────────────────┐
│   CloudFront (CDN + HTTPS)  │
│   + WAF (rate limiting)     │
└────────────┬────────────────┘
             │  Static assets
             ▼
    ┌─────────────┐
    │   S3 Bucket │  (React build, private + OAC)
    └─────────────┘

             │  API requests (/api/*)
             ▼
┌────────────────────────┐
│   API Gateway (HTTP)   │
│   + JWT Authorizer     │
└──────────┬─────────────┘
           │
           ▼
┌──────────────────────────┐
│   AWS Lambda             │
│   (FastAPI via Mangum)   │
│   Python 3.12 runtime    │
│   512 MB memory          │
│   30s timeout            │
└──────────┬───────────────┘
           │
     ┌─────┴──────┐
     │            │
     ▼            ▼
┌─────────┐  ┌──────────────────┐
│   RDS   │  │  Secrets Manager │
│ Postgres│  │  GEMINI_API_KEY  │
│ t3.micro│  │  DB credentials  │
│ Multi-AZ│  └──────────────────┘
└─────────┘
           │
           ▼
    Google Gemini API
    (external HTTPS call)
```

### Services used

| Service | Purpose | Tier |
|---|---|---|
| S3 | React static hosting | Standard |
| CloudFront | Global CDN, HTTPS termination | Standard |
| API Gateway (HTTP) | REST routing, throttling | Pay-per-request |
| Lambda | FastAPI runtime (Mangum) | Pay-per-invocation |
| RDS PostgreSQL | Relational data | db.t3.micro |
| Secrets Manager | API keys, DB creds | Per-secret/month |
| WAF | DDoS, rate limiting | Standard |
| VPC | Network isolation | Free |
| IAM | Least-privilege roles | Free |

### IAM — least privilege

```json
// Lambda execution role — only what it needs
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:ap-south-1:ACCOUNT:secret:libra360/*"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": ["ec2:CreateNetworkInterface","ec2:DescribeNetworkInterfaces","ec2:DeleteNetworkInterface"],
      "Resource": "*"
    }
  ]
}
```

### Lambda adapter (Mangum)

```python
# Add to backend/main.py for Lambda deployment
from mangum import Mangum
handler = Mangum(app, lifespan="off")
```

### Concurrency handling

- Lambda scales horizontally to hundreds of concurrent requests automatically
- RDS Proxy sits between Lambda and RDS to pool connections (avoids connection exhaustion from cold starts)
- API Gateway throttling: 1000 req/s burst, 500 req/s steady

---

## Option B: EC2 / ECS (higher throughput)

```
User Browser
     │
     ▼
Application Load Balancer (HTTPS)
     │
     ├─── /          → ECS Fargate (Frontend: Nginx + React)
     │
     └─── /api/*     → ECS Fargate (Backend: Uvicorn FastAPI)
                              │
                         RDS PostgreSQL
                         (Multi-AZ, db.t3.medium)
```

### When to use Option B
- Persistent WebSocket connections needed
- Predictable high traffic (>1000 req/min sustained)
- Background task workers (Celery)
- Compliance requires no Lambda cold starts

---

## CI/CD pipeline

```
GitHub Push (main)
      │
      ▼
GitHub Actions
  ├── Run tests (pytest)
  ├── docker build backend → push to ECR
  ├── docker build frontend → push to ECR
  └── Deploy:
      Option A: aws lambda update-function-code
      Option B: aws ecs update-service --force-new-deployment
```

---

## Security checklist

- [x] VPC with private subnets for RDS and Lambda
- [x] Security Groups: Lambda → RDS on port 5432 only
- [x] S3 bucket: no public access; served via CloudFront OAC only
- [x] All secrets in AWS Secrets Manager, not env vars in Lambda console
- [x] CloudFront HTTPS-only (redirect HTTP → HTTPS)
- [x] WAF rules: SQL injection, XSS, rate limiting
- [x] RDS encryption at rest (AES-256) and in transit (SSL)
- [x] IAM roles follow least-privilege principle
- [x] CloudTrail enabled for audit logging

---

## Cost estimate (Mumbai — ap-south-1, ~10k req/day)

| Service | Monthly Cost (USD) |
|---|---|
| Lambda (10k invocations, 512MB, 2s avg) | ~$0.50 |
| API Gateway | ~$1.00 |
| RDS t3.micro (single-AZ dev) | ~$15 |
| S3 + CloudFront | ~$2 |
| Secrets Manager | ~$0.80 |
| **Total** | **~$20/month** |

Production with Multi-AZ RDS and RDS Proxy: ~$60/month.
