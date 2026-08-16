import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { Plus, ClipboardList, User, LayoutDashboard, CalendarClock, ShieldCheck, LogOut } from "lucide-react";

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
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 3 4 14h6l-1 7 9-11h-6z" />
            </svg>
          </span>
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
              <Link to="/customer/new-request">
                <Plus size={15} strokeWidth={2} /> Új munka
              </Link>
              <Link to="/customer/requests">
                <ClipboardList size={15} strokeWidth={2} /> Munkáim
              </Link>
            </>
          )}
          {user?.role === "PROVIDER" && (
            <>
              <Link to="/provider/onboarding">
                <User size={15} strokeWidth={2} /> Profilom
              </Link>
              <Link to="/provider/dashboard">
                <LayoutDashboard size={15} strokeWidth={2} /> Munkák
              </Link>
              <Link to="/provider/planned">
                <CalendarClock size={15} strokeWidth={2} /> Tervezett munkák
              </Link>
            </>
          )}
          {user?.role === "ADMIN" && (
            <Link to="/admin/verifications">
              <ShieldCheck size={15} strokeWidth={2} /> Verifikációk
            </Link>
          )}
          {user && <NotificationBell role={user.role} />}
          {user && (
            <button className="link-button icon-label-button" onClick={handleLogout}>
              <LogOut size={14} strokeWidth={2} />
              {user.name}
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
