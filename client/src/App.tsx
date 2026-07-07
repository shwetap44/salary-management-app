import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { EmployeeListPage } from "./pages/EmployeeListPage";
import { EmployeeDetailPage } from "./pages/EmployeeDetailPage";
import { InsightsPage } from "./pages/InsightsPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeeListPage />} />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Route>
    </Routes>
  );
}
