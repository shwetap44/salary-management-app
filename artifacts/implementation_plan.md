# UI Refinements & TypeScript Test Configuration Plan

This plan details UX improvements (full country names instead of codes, page number jumps in pagination, and premium insights charts) and resolves the TypeScript type resolution errors in test files.

## User Review Required

> [!IMPORTANT]
> - **Full Country Names**: We will introduce a global country code-to-name utility mapping `IN` to `India`, `US` to `United States`, `GB` to `United Kingdom`, etc.
> - **Pagination numbers**: We will replace the previous/next buttons with a premium page navigation interface showing `1`, `2`, `3`, `4`, `5`, `6`, and `Last` dynamic jump buttons.
> - **Premium Charts**:
>   - *Headcount by country* will be upgraded from a green Bar Chart to a beautiful, multi-colored **Donut Chart** with a premium legend.
>   - *Salary by department* will be upgraded to a **horizontal Bar Chart** to make long department labels highly readable.
> - **Jest TypeScript configuration**: We will adjust `exclude` in `tsconfig.json` so the compiler environment indexes test files (solving "Cannot find name 'expect'"), and remove conflicting unused `@types/mocha` from `devDependencies`.

## Open Questions

None. The designs are ready for execution.

---

## Proposed Changes

### Configuration & Types

#### [MODIFY] [tsconfig.json](file:///Users/shweta/openSource/salary_management_app/server/tsconfig.json)
- Remove `**/*.test.ts` from `exclude` so that type declarations (like Jest globals) are resolved in test files.

#### [NEW] [tsconfig.build.json](file:///Users/shweta/openSource/salary_management_app/server/tsconfig.build.json)
- Create `tsconfig.build.json` extending `tsconfig.json` that *does* exclude tests (`**/*.test.ts` and `src/**/*.test.ts`) so they are not emitted during production builds.

#### [MODIFY] [package.json](file:///Users/shweta/openSource/salary_management_app/server/package.json)
- Change `"build": "tsc -p tsconfig.json"` to `"build": "tsc -p tsconfig.build.json"`.
- Remove `@types/mocha` to eliminate global testing namespace collisions.

---

### Frontend Utilities & Components

#### [NEW] [country.ts](file:///Users/shweta/openSource/salary_management_app/client/src/utils/country.ts)
- Expose `COUNTRY_NAMES` mapping object and `getCountryName(code)` helper function.

#### [MODIFY] [HeadcountByCountryChart.tsx](file:///Users/shweta/openSource/salary_management_app/client/src/components/HeadcountByCountryChart.tsx)
- Rebuild as a sleek **Donut Chart** (`PieChart` with `innerRadius`) featuring distinct colors, soft gaps between slices, full country names in the legends/tooltips, and smooth hover effects.

#### [MODIFY] [DepartmentSalaryChart.tsx](file:///Users/shweta/openSource/salary_management_app/client/src/components/DepartmentSalaryChart.tsx)
- Upgrade to a **horizontal layout Bar Chart** (moving departments to the Y-axis) to solve text truncation and angle problems for department labels.

---

### Pages

#### [MODIFY] [EmployeeListPage.tsx](file:///Users/shweta/openSource/salary_management_app/client/src/pages/EmployeeListPage.tsx)
- Import `getCountryName` to translate codes into full names in the table and the country filter dropdown.
- Implement pagination number generation logic showing `1`, `2`, `3`, `4`, `5`, `6`, `...`, and `Last` buttons.

#### [MODIFY] [EmployeeDetailPage.tsx](file:///Users/shweta/openSource/salary_management_app/client/src/pages/EmployeeDetailPage.tsx)
- Map `employee.country` code to full name using `getCountryName`.

#### [MODIFY] [InsightsPage.tsx](file:///Users/shweta/openSource/salary_management_app/client/src/pages/InsightsPage.tsx)
- Clean up duplicate `COUNTRY_NAMES` configuration and reference the global utility.

---

## Verification Plan

### Automated Tests
- Run backend tests: `npm test` (inside `server/`) to verify compilation and execution.
- Build server and client: `npm run build` inside both folders to ensure build pipelines compile without TypeScript issues.

### Manual Verification
- Navigate to `/employees` and verify full country names appear in the table column and filter dropdown.
- Verify the pagination shows numbered buttons (`1`, `2`, `3`, `4`, `5`, `6`, and `Last` link) and clicking them fetches and renders correct pages immediately.
- Go to `/insights` and verify the donut headcount chart and horizontal average salary chart display beautifully.
