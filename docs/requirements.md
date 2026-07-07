# Salary Management System — Requirements Document

## Goal
ACME's HR team currently manages salary data for 10,000 employees across multiple
countries in spreadsheets. This is slow, error-prone, and makes it hard to answer
basic questions about how the organization pays its people. This project replaces
that spreadsheet workflow with a web-based tool that lets an HR Manager manage
salary data directly and get aggregate visibility into pay across the org.

## User
Single persona: **HR Manager**. No employee self-service portal, no manager
hierarchy, no multi-role access in this phase.

## In Scope
- **Employee directory** — view, search, and filter employees (by name,
  department, country, employment status), with pagination suited to a
  10,000-row dataset.
- **Salary management** — view an employee's current salary and update it.
  Updates create a new salary history record rather than overwriting, so the
  org's pay history is preserved.
- **Salary history** — per-employee timeline of salary changes (effective
  date, amount, currency).
- **Multi-country support** — each employee has a country and a native
  currency (ISO 4217 code). Amounts are stored and displayed in the
  employee's native currency.
- **Annual/Monthly Timescale Toggle** — a global segment control in the console header that allows the HR Manager to instantly toggle the entire UI between annualized base salaries and their monthly equivalents (value divided by 12). This updates the employee table, detail views, histories, KPI summaries, and department distribution charts.
- **Insights dashboard** — the answer to "how does the org pay people":
  - KPI cards: total headcount, total payroll cost, average / median salary
  - Salary distribution by department (chart)
  - Salary distribution by country (chart)
  - **Currency handling for aggregates:** money-based metrics (total payroll
    cost, average/median salary) are always scoped to a single currency,
    selected via a country/currency filter — they are never summed across
    currencies. Headcount-based metrics (total headcount, headcount by
    department/country) are currency-agnostic and shown org-wide. This
    avoids fabricating false precision via unmanaged FX conversion while
    still giving the HR Manager a real, trustworthy number to look at.
- **Authentication** — a single HR Manager login (no public sign-up, no
  role-based permission tiers).
- **Seed data** — a script generating 10,000 realistic employees across
  multiple departments and countries, for realistic-scale testing.

## Explicitly Out of Scope (and why)

| Excluded | Reasoning |
|---|---|
| Currency conversion / live FX rates | Adds a dependency on external rate sources, staleness, and rounding rules — none of which are core to *managing* salary data. Storing native currency + code keeps the data accurate and leaves conversion as a clean future addition (a reporting layer, not a data model change). |
| Payroll processing, tax calculation, disbursement | A materially different problem domain — compliance-heavy and country-specific. This tool manages salary *data*, it doesn't run payroll. |
| Multi-role access control (self-service, department-manager views) | The brief specifies a single HR Manager persona. Building RBAC for personas that don't exist yet adds complexity without adding signal for this exercise. |
| Employee onboarding/offboarding workflows | Out of scope — employees are assumed to already exist; the focus is the salary lifecycle, not the employee lifecycle. |
| Dedicated audit-log UI | Salary history already gives an implicit audit trail for pay changes. A separate audit/logging UI is a reasonable v2, not needed to prove out the core problem. |

## Non-Functional Requirements
- Must remain responsive with 10,000+ employee records — indexed queries,
  server-side pagination/filtering, no N+1 query patterns.
- Data model should extend cleanly if scope grows later (e.g., FX conversion,
  additional roles) without a rewrite.

## Success Criteria
An HR Manager can log in, find any employee in seconds, update their salary
with full history preserved, and get an at-a-glance answer to "what are we
spending on payroll, and how is it distributed across departments and
countries?" — all without opening a spreadsheet.