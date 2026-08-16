import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../api/client";
import type { PlannedJobRequest, ServiceProviderProfile } from "../../api/types";
import { TRADE_ICONS, TRADE_LABELS } from "../../lib/labels";
import { MapView, type MapMarkerSpec } from "../../components/MapView";
import { ListSkeleton } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";

function defaultValidUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 16);
}

export function PlannedJobsPage() {
  const [jobs, setJobs] = useState<PlannedJobRequest[] | null>(null);
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [openQuoteFor, setOpenQuoteFor] = useState<string | null>(null);

  async function refresh() {
    const [j, prof] = await Promise.all([
      api.get<PlannedJobRequest[]>("/job-requests/planned/open"),
      api.get<ServiceProviderProfile>("/providers/me").catch(() => null),
    ]);
    setJobs(j);
    setProfile(prof);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h1>Tervezett munkák</h1>
      <p className="subtitle">Küldj árajánlatot a hozzád illő nyitott munkákra. Munkánként egy ajánlatot adhatsz.</p>
      {jobs === null && <ListSkeleton />}
      {jobs?.length === 0 && <p className="subtitle">Jelenleg nincs hozzád illő tervezett munka.</p>}
      {jobs && jobs.length > 0 && (
        <MapView
          center={profile ? { latitude: profile.latitude, longitude: profile.longitude } : jobs[0]}
          zoom={12}
          markers={[
            ...(profile
              ? [
                  {
                    id: "me",
                    latitude: profile.latitude,
                    longitude: profile.longitude,
                    emoji: "🔧",
                    label: "Én",
                    variant: "primary" as const,
                  },
                ]
              : []),
            ...jobs.map<MapMarkerSpec>((jr) => ({
              id: jr.id,
              latitude: jr.latitude,
              longitude: jr.longitude,
              emoji: TRADE_ICONS[jr.trade],
              label: jr.customer.name,
              popup: (
                <div className="map-popup">
                  <strong>{TRADE_LABELS[jr.trade]}</strong>
                  {jr.description}
                  <br />
                  {jr.customer.name}
                  {!jr.alreadyQuoted && (
                    <>
                      <br />
                      <button onClick={() => setOpenQuoteFor(jr.id)}>Árajánlat küldése</button>
                    </>
                  )}
                </div>
              ),
            })),
          ]}
        />
      )}
      <ul className="list">
        {jobs?.map((jr) => (
          <li key={jr.id} className="list-item column">
            <div className="row-between full-width">
              <div className="list-item-body">
                <strong>
                  <span className="trade-icon">{TRADE_ICONS[jr.trade]}</span> {TRADE_LABELS[jr.trade]}
                </strong>
                <span className="muted">{jr.description}</span>
                <span className="muted">
                  {jr.customer.name} · {jr.address}
                </span>
                {jr.preferredStartAt && jr.preferredEndAt && (
                  <span className="muted">
                    Kívánt időpont: {new Date(jr.preferredStartAt).toLocaleDateString("hu-HU")} –{" "}
                    {new Date(jr.preferredEndAt).toLocaleDateString("hu-HU")}
                  </span>
                )}
              </div>
              {jr.alreadyQuoted ? (
                <span className="badge status-booked">Ajánlat elküldve</span>
              ) : (
                <button onClick={() => setOpenQuoteFor(openQuoteFor === jr.id ? null : jr.id)}>
                  Árajánlat küldése
                </button>
              )}
            </div>
            {openQuoteFor === jr.id && (
              <QuoteForm
                jobRequestId={jr.id}
                onSubmitted={() => {
                  setOpenQuoteFor(null);
                  refresh();
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuoteForm({ jobRequestId, onSubmitted }: { jobRequestId: string; onSubmitted: () => void }) {
  const { showToast } = useToast();
  const [price, setPrice] = useState(15000);
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(120);
  const [message, setMessage] = useState("");
  const [proposedStartAt, setProposedStartAt] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntil());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/quotes", {
        jobRequestId,
        price,
        estimatedDurationMinutes,
        message: message || undefined,
        proposedStartAt: proposedStartAt ? new Date(proposedStartAt).toISOString() : undefined,
        validUntil: new Date(validUntil).toISOString(),
      });
      showToast("Ajánlat elküldve!");
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült elküldeni az ajánlatot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="coord-row">
        <label>
          Ár (Ft)
          <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </label>
        <label>
          Becsült időtartam (perc)
          <input
            type="number"
            min={1}
            value={estimatedDurationMinutes}
            onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
          />
        </label>
      </div>
      <label>
        Üzenet (opcionális)
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
      </label>
      <div className="coord-row">
        <label>
          Javasolt kezdés (opcionális)
          <input type="datetime-local" value={proposedStartAt} onChange={(e) => setProposedStartAt(e.target.value)} />
        </label>
        <label>
          Ajánlat érvényessége
          <input
            type="datetime-local"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
          />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Küldés..." : "Ajánlat elküldése"}
      </button>
    </form>
  );
}
