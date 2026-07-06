-- 001_init.sql
-- Core schema: employees and their append-only salary history.
-- See docs/architecture.md for the reasoning behind these design choices.

CREATE TABLE IF NOT EXISTS employees (
    id              BIGSERIAL PRIMARY KEY,
    employee_code   VARCHAR(20) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    department      VARCHAR(100) NOT NULL,
    country         VARCHAR(2)  NOT NULL,   -- ISO 3166-1 alpha-2
    currency_code   VARCHAR(3)  NOT NULL,   -- ISO 4217
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only: rows are inserted, never updated or deleted.
-- currency_code is captured at write time and must not be re-derived from
-- the employee's current country, so relocations never corrupt history.
CREATE TABLE IF NOT EXISTS salary_history (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id),
    amount          NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    currency_code   VARCHAR(3) NOT NULL,
    effective_date  DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country);
CREATE INDEX IF NOT EXISTS idx_salary_history_employee_effective
    ON salary_history(employee_id, effective_date DESC);
