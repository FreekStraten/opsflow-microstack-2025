# 🧭 OpsFlow Microstack (DevOps · 2 EC)

[![Node.js CI](https://github.com/FreekStraten/Devops-Freek-Straten/workflows/Node.js%20CI/badge.svg)](https://github.com/FreekStraten/Devops-Freek-Straten/actions?query=workflow%3A%22Node.js+CI%22)
[![CI API](https://github.com/FreekStraten/Devops-Freek-Straten/workflows/CI%20API/badge.svg)](https://github.com/FreekStraten/Devops-Freek-Straten/actions?query=workflow%3A%22CI+API%22)
[![CI Lint](https://github.com/FreekStraten/Devops-Freek-Straten/workflows/CI%20Lint/badge.svg)](https://github.com/FreekStraten/Devops-Freek-Straten/actions?query=workflow%3A%22CI+Lint%22)
[![CI Notification](https://github.com/FreekStraten/Devops-Freek-Straten/workflows/CI%20Notification%20Service/badge.svg)](https://github.com/FreekStraten/Devops-Freek-Straten/actions?query=workflow%3A%22CI+Notification+Service%22)
![NodeJS](https://img.shields.io/badge/NodeJS-20.x-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-4DB33D)
![Docker](https://img.shields.io/badge/Docker-compose-blue)
![Status](https://img.shields.io/badge/status-active-brightgreen)

**DevOps-opdracht (Avans HBO-ICT, 2025 – 2 EC)** — richt zich op het **automatiseren, containeriseren en monitoren** van een NodeJS-microservice.  
De nadruk ligt op CI-kwaliteit, observability en herhaalbare deployment via Docker Compose.

> **Focus van de opdracht:** Continuous Integration · Containerization · Monitoring · Observability

---

## ⚙️ Doel

Een kleine, maar complete DevOps-omgeving opzetten waarin meerdere services (API, database, monitoring) samenwerken:

- API en database draaien in containers  
- Monitoring via Prometheus + Grafana  
- Automatische tests en linting via GitHub Actions  
- Persistent data + metrics via Docker volumes  
- Code-kwaliteit en configuratie as code  

---

## 🧩 Tech stack
Node.js · Express · MongoDB · Docker Compose · Prometheus · Grafana · ESLint · Jest · GitHub Actions

---

## 📦 Projectstructuur
```
opsflow-microstack/
├── api/                     # Express + MongoDB service
│   ├── routes/
│   ├── services/database.js
│   ├── app.js               # + Prometheus metrics middleware
│   └── package.json
├── docker-compose.yml       # API + DB + Monitoring stack
├── prometheus/prometheus.yml
├── grafana/
│   ├── provisioning/        # Datasource & dashboard config
│   └── dashboards/
└── docs/                    # Screenshots & README assets
```

---

## 🚀 Quick Start

> Vereisten:  
> • **Docker Desktop** (v4.30+)  
> • **NodeJS 20+** (alleen nodig voor lokale ontwikkeling)  
> • **Poorten vrij:** 3000 (API), 9090 (Prometheus), 3100 (Grafana)

### 1️⃣ Clone repo
```bash
git clone https://github.com/FreekStraten/opsflow-microstack.git
cd opsflow-microstack
```

### 2️⃣ Start volledige omgeving
```bash
docker compose up -d
```

Wacht tot alle containers “healthy” zijn (`docker ps`).

### 3️⃣ Open services

| Service | URL | Opmerking |
|----------|-----|-----------|
| API | [http://localhost:3000/users](http://localhost:3000/users) | REST-endpoint (+ /metrics) |
| Prometheus | [http://localhost:9090/targets](http://localhost:9090/targets) | Targets moeten UP zijn |
| Grafana | [http://localhost:3100](http://localhost:3100) | Inloggen met `admin / admin` |

### 4️⃣ Stoppen
```bash
docker compose down
```

---

## 🧠 Learning Focus

> **Continuous Integration · Containerization · Monitoring & Alerting**

**CI/CD pipeline**
- GitHub Actions voor lint + tests bij iedere push  
- Build van Docker image bij release tag  

**Containerization**
- Alle services geconfigureerd via `docker-compose.yml`  
- Netwerk, volumes en omgevingsvariabelen as code  

**Monitoring & Metrics**
- Express-API instrumented met `express-prom-bundle`  
- Prometheus scrapet API en MongoDB-exporter  
- Grafana dashboard met requests/s, latency en error-rate  

---

## 📊 Monitoring Preview
*(screenshots worden toegevoegd)*

| Tool | Screenshot |
|------|-------------|
| Prometheus targets | ![prometheus](docs/prometheus.png) |
| Grafana dashboard | ![grafana](docs/grafana.png) |

---

## 📝 Korte opdrachtomschrijving

### 1.1 – Repository opzetten
Aanmaken van GitHub Classroom repository en team voor het DevOps-project.

### 1.2 – NodeJS-applicatie
Basissetup van een Express-applicatie die later als microservice fungeert.

### 1.3 – MongoDB integratie
Aansluiten van MongoDB-database, zowel lokaal als via container.

### 1.4 – Automatische tests
Schrijven van Jest + Supertest unit-tests om API endpoints te verifiëren.

### 1.5 – Statische code-analyse
Inrichten van ESLint om codekwaliteit automatisch te controleren.

### 1.6 – Omgevingsvariabelen
Gebruik van `.env` voor configuratie (MONGO_URL, DB_NAME) en scheiding van omgevingen.

### 2.x – CI integratie
GitHub Actions workflows voor automatisch linten, testen en badges genereren.

### 3.x – Containerization
Opzetten van Dockerfiles, Compose-stack en netwerkverbinding tussen API en database.

### 4.x – Monitoring
Integreren van Prometheus en Grafana om metrics te verzamelen en dashboards te tonen.

### 5–6 – Metrics, Grafana en Alerts
Prometheus metrics endpoint toegevoegd aan API, dashboards geconfigureerd, alerts opgezet.

---

## 🏫 Credits
Ontwikkeld voor het vak **DevOps (2 EC)** – Avans Hogeschool, 2025  
**Auteur:** Freek Straten  
**Doel:** automatisering en monitoring binnen een containerized microservice-omgeving.
