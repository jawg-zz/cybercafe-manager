import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stations from "./pages/Stations";
import Sessions from "./pages/Sessions";
import Customers from "./pages/Customers";
import POS from "./pages/POS";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="stations" element={<Stations />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="customers" element={<Customers />} />
          <Route path="pos" element={<POS />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
