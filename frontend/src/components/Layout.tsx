import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Lunda
        </Link>
        <nav>
          {!user && (
            <>
              <Link to="/login">Bejelentkezés</Link>
              <Link to="/register" className="btn-link">
                Regisztráció
              </Link>
            </>
          )}
          {user?.role === "CUSTOMER" && (
            <>
              <Link to="/customer/new-request">Új munka</Link>
              <Link to="/customer/requests">Munkáim</Link>
            </>
          )}
          {user?.role === "PROVIDER" && (
            <>
              <Link to="/provider/onboarding">Profilom</Link>
              <Link to="/provider/dashboard">Munkák</Link>
            </>
          )}
          {user?.role === "ADMIN" && <Link to="/admin/verifications">Verifikációk</Link>}
          {user && (
            <button className="link-button" onClick={handleLogout}>
              Kijelentkezés ({user.name})
            </button>
          )}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
