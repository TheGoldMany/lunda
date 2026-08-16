import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { AppNotification, Role } from "../api/types";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "most";
  if (minutes < 60) return `${minutes} perce`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} órája`;
  return `${Math.round(hours / 24)} napja`;
}

function linkFor(n: AppNotification, role: Role): string {
  if (role === "CUSTOMER") {
    return n.jobRequestId ? `/customer/requests/${n.jobRequestId}` : "/customer/requests";
  }
  if (role === "PROVIDER") {
    return n.type === "VERIFICATION_DECIDED" ? "/provider/onboarding" : "/provider/dashboard";
  }
  return "/";
}

export function NotificationBell({ role }: { role: Role }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    setNotifications(await api.get<AppNotification[]>("/notifications"));
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleSelect(n: AppNotification) {
    setOpen(false);
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      api.patch(`/notifications/${n.id}/read`).catch(() => {});
    }
    navigate(linkFor(n, role));
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    await api.patch("/notifications/read-all");
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button type="button" className="bell-button" onClick={() => setOpen((o) => !o)} aria-label="Értesítések">
        🔔
        {unreadCount > 0 && <span className="bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="row-between notification-panel-header">
            <strong>Értesítések</strong>
            {unreadCount > 0 && (
              <button type="button" className="link-button" onClick={handleMarkAllRead}>
                Összes olvasottnak jelölése
              </button>
            )}
          </div>
          {notifications.length === 0 && <p className="muted notification-empty">Nincs még értesítésed.</p>}
          <ul className="notification-list">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className={`notification-item ${n.read ? "" : "unread"}`}
                  onClick={() => handleSelect(n)}
                >
                  <span className="notification-title">{n.title}</span>
                  {n.body && <span className="muted">{n.body}</span>}
                  <span className="notification-time">{relativeTime(n.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
