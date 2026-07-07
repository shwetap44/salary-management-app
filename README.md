# ACME Salary Management System

A production-ready, full-stack console application designed for an HR Manager to securely manage salary data and gain analytical insights for an organization of 10,000+ employees across multiple countries and currencies.

---

##  Key Features

- **Secure HR Authentication**: Guarded by JWT-based route protection. Single HR Manager persona access with secure credential checking decoupled from direct environment imports.
- **Dynamic Pay Timescale Toggle**: A global segmented control in the console header allowing the HR Manager to toggle the entire application instantly between **Annualized Rates** and **Monthly Equivalents** (value divided by 12).
- **Searchable Employee Directory**: Searchable by name/email, filterable by department and country (with full country names displayed), backed by high-performance index queries and server-side pagination to handle 10,000+ rows instantly.
- **Pay Lifecycle & History**: Read/write pay records stored in the employee's native currency. Salary updates append to `salary_history` rather than mutating existing rows, preserving audit logs.
- **Premium Insights Dashboard**:
  - **KPI Aggregates**: Displays Total Headcount, total payroll metrics, average salary, and median salary (using SQL-backed `PERCENTILE_CONT` calculations). Financial aggregates automatically scale based on the active timescale mode.
  - **Sleek Data Visualization**: Featuring a high-end multi-color **Donut Chart** (proportional headcount by country) and a **horizontal Bar Chart** (average salary by department, customized with vertical spacing and bar thickness limits for maximum legibility).

---

##  Technology Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL (node-pg pool), JWT.
- **Backend Testing**: Jest, Supertest.
- **Frontend**: React (Vite template), TypeScript, Tailwind CSS, Recharts.
- **Frontend Testing**: Vitest, React Testing Library.

---

##  Project Setup & Installation

The project is split into a `server` and a `client` folder. Follow the steps below to set up both.

### 1. Database & Environment Setup
Ensure you have a PostgreSQL database running locally (or hosted) and set up the server environment:

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your PostgreSQL credentials:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
   CORS_ORIGIN=http://localhost:5173
   JWT_SECRET=your-secure-jwt-secret
   HR_MANAGER_EMAIL=hr@acme.test
   HR_MANAGER_PASSWORD=change-me
   ```

### 2. Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run database migrations to create the `employees` and `salary_history` schemas:
   ```bash
   npm run migrate
   ```
3. Run the seed script to generate **10,000 realistic employees** with multi-year salary histories:
   ```bash
   npm run seed
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be available at `http://localhost:4000`.*

### 3. Frontend Setup
1. Open a new terminal window and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will start at `http://localhost:5173`.*

---

##  Test Credentials
To log in and explore the application:
- **Email**: `hr@acme.test`
- **Password**: `change-me` *(or whatever value you configured in the server `.env`)*

---

##  Running Tests

A core criteria of the assessment is clean, fast, and deterministic tests:

### Backend Tests
From the `server/` directory, run unit and integration tests:
```bash
npm test
```
*These tests run in Jest using an in-memory repository to test business logic and services in milliseconds, with separate repository tests running against a test database connection.*

### Frontend Tests
From the `client/` directory, run unit tests:
```bash
npm test
```
*These tests run in Vitest checking component formatting, KPI calculations, and render behaviors.*

---

##  Architectural Decisions & Code Craftsmanship

This project demonstrates strong engineering fundamentals and solid product choices:
1. **Decoupled Architecture**: 
   - Backend layers are strictly separated: `Routes -> Controllers -> Service Layer -> Repository Layer`.
   - Business rules (like append-only salary histories and native currency validation) live in the **Service Layer** and are decoupled from the database, allowing us to unit test them in milliseconds using fake in-memory repositories.
   - `AuthService` is initialized at the route boundaries, decoupling authentication code from direct `process.env` dependencies.
2. **Performant DB Operations**:
   - Seed generation is batched to complete in seconds for 10,000 records.
   - Money metrics (average/median salary) are computed directly in SQL using PostgreSQL window/aggregate functions (`DISTINCT ON`, `PERCENTILE_CONT`) instead of fetching 10,000 records into Node's event loop memory.
3. **UX & Responsive Pagination**:
   - Rather than dumping 10,000 elements into the browser DOM, all employee directory listings are server-side paginated.
   - Built custom pagination controls with page number buttons (`1`, `2`, `3`, `4`, `5`, `6`, `...`, `Last`) so the HR manager can navigate the dataset efficiently.
4. **UX-Friendly Insights Visualization**:
   - **Donut Chart**: Shows headcount distribution across regions with full country names.
   - **Horizontal Bars**: Prevents department name text-truncation.
   - **Segmented Toggle**: An intuitive pay scale setting toggles display modes cleanly throughout the entire UI.

---

##  Documentation Artifacts
For further details on specifications and trade-offs, check the documentation files:
- [Requirements Specifications](file:///Users/shweta/openSource/salary_management_app/docs/requirements.md)
- [Architecture & Testing Strategy](file:///Users/shweta/openSource/salary_management_app/docs/architecture.md)
