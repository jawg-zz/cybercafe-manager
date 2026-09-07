# 🖥️ Cyber Cafe Manager

A full-featured cyber cafe management system: station tracking, time-based
billing, POS for snacks/drinks/services, payments (cash + M-Pesa), customers,
reports, and role-based staff access.

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Backend  | Python 3.13, FastAPI, SQLAlchemy, SQLite, JWT      |
| Frontend | React 18, Vite, react-router                      |
| Payments | Pluggable providers — Cash + M-Pesa (Daraja stub) |

## Features

- **Auth & roles** — Admin / Cashier / Technician logins with JWT + RBAC
- **Stations** — add/edit PCs, specs, per-station hourly rate, live status
  (available / in-use / offline / maintenance)
- **Sessions & billing** — start/end sessions, prepaid minutes, automatic
  time-based billing (rounded up to the minute), live balance
- **Customers** — walk-in or registered, phone lookup, visit history
- **POS & extras** — snacks, drinks, printing, photocopy; stock levels;
  items added straight to a session's bill
- **Payments** — cash and M-Pesa (STK-push stub, swap in real Daraja
  credentials when ready), receipts with references; payment history page
- **Products & stock** — add/edit products, adjust stock levels
- **Staff** — admin-managed users with roles (admin / cashier / technician)
- **Reports** — live dashboard, 7-day revenue, station utilization, CSV export
- **Settings** — cafe name, currency, tax rate, default rate, business hours
- **Role-based UI** — cashiers/technicians only see what their role allows

## Quick start

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m app.seed        # creates admin/admin123 + sample data
.venv/bin/uvicorn app.main:app --port 8002
```

API docs: http://127.0.0.1:8002/docs

### Frontend

```bash
cd frontend
npm install
npm run dev                          # http://127.0.0.1:5173
```

The Vite dev server proxies `/api` to the backend on port 8002.

### Docker (recommended for deployment)

```bash
docker compose up --build
# Frontend: http://localhost:8080   Backend API: http://localhost:8002
```

The frontend container (nginx) serves the built SPA and proxies `/api` to the
backend container. The SQLite database persists in the `cafe-data` volume.
Set `SECRET_KEY` (and M-Pesa vars) via environment or a `.env` file.

### Tests

```bash
cd backend
.venv/bin/python -m pytest tests/ -q
```

## Default login

| Role      | Username | Password |
| --------- | -------- | -------- |
| Admin     | `admin`  | `admin123` |

## Project layout

```
backend/
  app/
    api/routes/     # auth, stations, sessions, payments, products, reports, settings
    models/         # SQLAlchemy models
    schemas/        # Pydantic schemas
    services/       # security (JWT), billing engine, payment providers
    main.py         # FastAPI app
    seed.py         # demo data
  tests/            # pytest suite (27 tests)
frontend/
  src/
    pages/          # Dashboard, Stations, Sessions, POS, Payments, Products,
                    # Customers, Reports, Settings, Staff
    components/     # Layout
    api.js          # fetch wrapper with JWT
docker-compose.yml  # backend + frontend (nginx) one-command deployment
```

## M-Pesa

`backend/app/services/payments/mpesa_stub.py` simulates an STK push. To go
live, implement `charge()` with the Daraja Lipa Na M-Pesa Online API and set
`mpesa_consumer_key`, `mpesa_consumer_secret`, `mpesa_passkey`,
`mpesa_shortcode` in the backend `.env`.
