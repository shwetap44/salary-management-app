# Task Checklist - UI Improvements & TypeScript Configuration

- [x] Remove `@types/mocha` and resolve `tsconfig.json` test exclusions in server
- [x] Create `tsconfig.build.json` and update build script in server `package.json`
- [x] Create `client/src/utils/country.ts` mapping utility
- [x] Update `HeadcountByCountryChart.tsx` to display a Donut chart with full country names
- [x] Update `DepartmentSalaryChart.tsx` to display a horizontal Bar chart with increased spacing
- [x] Update `EmployeeListPage.tsx` to show full country names and pagination number buttons (1, 2, 3, 4, 5, 6, and Last)
- [x] Update `EmployeeDetailPage.tsx` to show full country names
- [x] Update `InsightsPage.tsx` to use the global country mapping utility
- [x] Run automated tests and verify manually

## Pay Period Timescale Switch
- [x] Implement global `timescale` selection state in frontend `AuthContext`
- [x] Render segmented pay period toggle control in header layout
- [x] Integrate timescale-aware calculations in `Money` formatting component and tests
- [x] Update employee list, detail pages, and insights KPI labels/charts to scale automatically
- [x] Document timescale toggle design changes in `docs/requirements.md` and `walkthrough.md`
