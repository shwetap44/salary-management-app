# Architecture Document — Salary Management System

## Tech Stack & Rationale

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express + TypeScript | Matches the JD's core stack. TypeScript adds compile-time safety over a plain data model (salary amounts, currency codes) where a typo-class bug is expensive. |
| Database | PostgreSQL | Relational fit for structured, query-heavy data (filters, aggregates, joins across salary history). Strong support for window functions (`DISTINCT ON`, `PERCENTILE_CONT`) which we rely on for "current salary" and median calculations. |
| Frontend | React + TypeScript (Vite) | Matches the JD. Vite over CRA for faster dev/build. |
| Component library | shadcn/ui + Recharts | shadcn gives accessible, unstyled-enough primitives (table, dropdown, dialog) without fighting a heavy design system. Recharts is lightweight and sufficient for the two chart types we need (bar/donut) — no need for a heavier viz library at this scope. |
| Auth | JWT, single HR Manager role | Matches the scoped single-persona requirement — no need for session infra or RBAC machinery for one role. |

## System Overview

```
React (client) ──HTTP/JSON──> Express API ──> Service layer ──> Repository layer ──> PostgreSQL
```

Layered backend, each layer with one responsibility:

- **Routes** — HTTP concerns only (method, path, request parsing, status codes)
- **Controllers** — translate HTTP request → service call → HTTP response. No business logic.
- **Services** — business rules (e.g., "updating a salary creates a new history row, never mutates an old one"; "current salary = latest history row by effective_date")
- **Repositories** — the only layer that talks SQL. Everything else is DB-agnostic, which also makes services trivial to unit test with a fake repository.

This separation is what makes the testing strategy below viable — services can be tested with an in-memory fake repository, no database required for most tests.

## Data Model

(As finalized in `requirements.md` discussion — restated here as the source of truth for implementation.)

```sql
employees(
  id, employee_code, first_name, last_name, email,
  department, country, currency_code, status,
  created_at, updated_at
)

salary_history(
  id, employee_id (FK), amount, currency_code,
  effective_date, created_at
)
```

Key decisions:
- **No `current_salary` column on `employees`.** It's derived — latest `salary_history` row per employee by `effective_date`. One source of truth; no risk of the two drifting apart.
- **`salary_history` is append-only.** Updating a salary inserts a new row; nothing is ever overwritten. This gives us pay history for free and matches how HR audits actually work.
- **`currency_code` is duplicated onto `salary_history`**, not just inferred from the employee's current country. If an employee relocates later, historical salary rows must keep the currency they were actually paid in at the time — re-deriving it from the employee's *current* country would silently corrupt history.
- **Department and country are plain columns**, not normalized tables — there's no sub-department hierarchy or country metadata beyond a code in scope. Normalizing now would be speculative complexity; the schema can be migrated to normalized tables later without touching the API contract.

## Currency Handling for Aggregates

Documented in `requirements.md`, restated here as an architectural constraint:
money-based aggregates are **always filtered to a single currency** before being computed — never summed across currencies. Headcount-based aggregates are currency-agnostic. This is enforced at the service layer: any service method returning a monetary total requires a `country` (or `currencyCode`) parameter; there is no "all countries" code path for monetary sums.

## API Surface

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | HR Manager login |
| GET | `/api/employees` | List employees — `?search=&department=&country=&page=&limit=` |
| GET | `/api/employees/:id` | Single employee detail, including current salary |
| GET | `/api/employees/:id/salary-history` | Full salary history for one employee |
| POST | `/api/employees/:id/salary` | Add a new salary record (never edits/deletes existing rows) |
| GET | `/api/meta/countries` | Distinct countries + currency codes present in the data, to populate the filter dropdown |
| GET | `/api/insights/headcount` | Org-wide headcount, and headcount by department/country (currency-agnostic) |
| GET | `/api/insights/summary?country=IN` | Total payroll cost, average, median salary — scoped to one country/currency (required param) |
| GET | `/api/insights/salary-distribution?country=IN&groupBy=department` | Chart data for salary distribution within one currency |

## Scalability Considerations (10,000+ employees)

- All list/filter endpoints are **server-side paginated** — the client never requests or renders all 10,000 rows at once.
- `department`, `country`, and `(employee_id, effective_date)` are indexed — filters and "latest salary per employee" lookups stay index-backed rather than full table scans.
- "Current salary" and "median salary" are computed in SQL (`DISTINCT ON`, `PERCENTILE_CONT`) rather than pulled into application memory and computed in JS — this scales with the database, not with Node's event loop.
- Seed script uses batched inserts (not one INSERT per row) to keep seeding 10,000 employees + history fast and repeatable.

## Testing Strategy

- **Unit tests** — service layer, using an in-memory fake repository. Fast, deterministic, no database dependency. This is where business rules are verified: e.g., "adding a salary record never mutates prior rows," "current salary picks the latest effective_date," "monetary summary requires a currency filter."
- **Integration tests** — repository layer and key API endpoints, run against a real (test) Postgres instance, seeded with a small deterministic fixture (not the full 10,000-row seed) so tests stay fast.
- **Frontend tests** — component-level tests for the insights dashboard (renders correct KPIs given mock data) and the employee table (filter/pagination behavior).
- Tests are written alongside each unit of implementation, not deferred to the end — visible in the commit history as tests and implementation landing together.

## Deployment

- Backend: Render/Railway (Node service)
- Database: managed Postgres (Neon/Supabase free tier)
- Frontend: Vercel
- Environment config via `.env`, never committed (see `.gitignore`)yeah this works