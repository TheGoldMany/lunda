import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { NewJobRequestPage } from "./pages/customer/NewJobRequest";
import { MyJobRequestsPage } from "./pages/customer/MyJobRequests";
import { JobRequestDetailPage } from "./pages/customer/JobRequestDetail";
import { ProviderOnboardingPage } from "./pages/provider/ProviderOnboarding";
import { ProviderDashboardPage } from "./pages/provider/ProviderDashboard";
import { AdminVerificationsPage } from "./pages/admin/AdminVerifications";
import { roleHome } from "./lib/roleHome";

function Home() {
  const { user } = useAuth();
  if (user) return <Navigate to={roleHome(user.role)} replace />;
  return (
    <div className="card">
      <h1>Lunda</h1>
      <p className="subtitle">
        Uber-szerű piactér vízi-, gáz- és villanyszerelési munkákra. Jelentkezz be, vagy regisztrálj megrendelőként
        vagy szolgáltatóként.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/customer/new-request"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <NewJobRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/requests"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <MyJobRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/requests/:id"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <JobRequestDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/provider/onboarding"
          element={
            <ProtectedRoute roles={["PROVIDER"]}>
              <ProviderOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute roles={["PROVIDER"]}>
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminVerificationsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
