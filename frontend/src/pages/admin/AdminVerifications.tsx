import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { ServiceProviderProfile } from "../../api/types";
import { TRADE_ICONS, TRADE_LABELS } from "../../lib/labels";
import { ListSkeleton } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";

export function AdminVerificationsPage() {
  const { showToast } = useToast();
  const [pending, setPending] = useState<ServiceProviderProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    setPending(await api.get<ServiceProviderProfile[]>("/providers/pending"));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setError(null);
    setBusyId(id);
    try {
      await api.patch(`/providers/${id}/verify`, { status });
      showToast(status === "APPROVED" ? "Szolgáltató jóváhagyva." : "Szolgáltató elutasítva.");
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült frissíteni");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card">
      <h1>Szolgáltató-verifikációk</h1>
      {error && <p className="error">{error}</p>}
      {pending === null && <ListSkeleton />}
      {pending?.length === 0 && <p className="subtitle">Nincs elbírálásra váró profil.</p>}
      <ul className="list">
        {pending?.map((p) => (
          <li key={p.id} className="list-item column">
            <div className="row-between full-width">
              <div className="list-item-body">
                <strong>{p.user?.name}</strong>
                <span className="muted">{p.user?.phone}</span>
                <span className="muted">{p.trades.map((t) => `${TRADE_ICONS[t]} ${TRADE_LABELS[t]}`).join(", ")}</span>
                {p.licenseDocumentUrl && (
                  <a href={p.licenseDocumentUrl} target="_blank" rel="noreferrer">
                    Dokumentum megtekintése
                  </a>
                )}
              </div>
              <div className="row">
                <button onClick={() => decide(p.id, "APPROVED")} disabled={busyId === p.id}>
                  Jóváhagyás
                </button>
                <button className="secondary" onClick={() => decide(p.id, "REJECTED")} disabled={busyId === p.id}>
                  Elutasítás
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
