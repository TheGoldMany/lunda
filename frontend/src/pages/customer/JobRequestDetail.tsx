import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { Booking, JobRequest, Quote, RankedProvider } from "../../api/types";
import { BOOKING_STATUS_LABELS, JOB_STATUS_LABELS, TRADE_ICONS, TRADE_LABELS } from "../../lib/labels";
import { ReviewForm } from "../../components/ReviewForm";
import { Chat } from "../../components/Chat";
import { PaymentBox } from "../../components/PaymentBox";
import { MapView, type MapMarkerSpec } from "../../components/MapView";
import { ListSkeleton } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";

export function JobRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
  const [providers, setProviders] = useState<RankedProvider[] | null>(null);
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function refresh() {
    if (!id) return;
    const jr = await api.get<JobRequest>(`/job-requests/${id}`);
    setJobRequest(jr);

    if (jr.status === "OPEN" && jr.urgency === "URGENT") {
      setProviders(await api.get<RankedProvider[]>(`/job-requests/${id}/providers`));
    }
    if (jr.urgency === "PLANNED") {
      setQuotes(await api.get<Quote[]>(`/job-requests/${id}/quotes`));
    }

    if (jr.booking) {
      const bookings = await api.get<Booking[]>("/bookings/me");
      setBooking(bookings.find((b) => b.jobRequestId === jr.id) ?? null);
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAcceptQuote(quoteId: string) {
    setAcceptError(null);
    setAcceptingId(quoteId);
    try {
      await api.post(`/quotes/${quoteId}/accept`);
      showToast("Foglalás létrehozva!");
      await refresh();
    } catch (err) {
      setAcceptError(err instanceof ApiError ? err.message : "Nem sikerült elfogadni az ajánlatot");
    } finally {
      setAcceptingId(null);
    }
  }

  if (!jobRequest) return <p>Betöltés...</p>;

  return (
    <div className="card">
      <div className="row-between">
        <h1>
          <span className="trade-icon">{TRADE_ICONS[jobRequest.trade]}</span> {TRADE_LABELS[jobRequest.trade]}
        </h1>
        <span className={`badge status-${jobRequest.status.toLowerCase()}`}>
          {JOB_STATUS_LABELS[jobRequest.status]}
        </span>
      </div>
      <p>{jobRequest.description}</p>
      <p className="muted">{jobRequest.address}</p>
      {jobRequest.urgency === "PLANNED" && jobRequest.preferredStartAt && jobRequest.preferredEndAt && (
        <p className="muted">
          Kívánt időpont: {new Date(jobRequest.preferredStartAt).toLocaleString("hu-HU")} –{" "}
          {new Date(jobRequest.preferredEndAt).toLocaleString("hu-HU")}
        </p>
      )}

      {jobRequest.status === "OPEN" && jobRequest.urgency === "URGENT" && (
        <section>
          <h2>Elérhető szakemberek</h2>
          <p className="subtitle">
            Értesítettük a legközelebbi verifikált szakembereket. Amint valaki elfogadja, itt fog megjelenni.
          </p>
          {providers === null && <ListSkeleton rows={2} />}
          {providers && providers.length === 0 && <p>Jelenleg nincs elérhető szakember ebben a szakágban.</p>}
          {providers && providers.length > 0 && (
            <MapView
              center={{ latitude: jobRequest.latitude, longitude: jobRequest.longitude }}
              zoom={12}
              markers={[
                {
                  id: "job",
                  latitude: jobRequest.latitude,
                  longitude: jobRequest.longitude,
                  emoji: "🏠",
                  label: "A munka helyszíne",
                  variant: "primary",
                },
                ...providers.map<MapMarkerSpec>((p) => ({
                  id: p.id,
                  latitude: p.latitude,
                  longitude: p.longitude,
                  emoji: TRADE_ICONS[jobRequest.trade],
                  label: p.providerName,
                  popup: (
                    <div className="map-popup">
                      <strong>{p.providerName}</strong>
                      {p.distanceKm} km · kb. {p.estimatedArrivalMinutes} perc
                      <br />
                      {p.ratingAvg ? `${p.ratingAvg.toFixed(1)} ★` : "Nincs értékelés"} · ~{p.calloutFee} Ft
                    </div>
                  ),
                })),
              ]}
            />
          )}
          <ul className="list">
            {providers?.map((p) => (
              <li key={p.id} className="list-item">
                <div className="list-item-body">
                  <strong>{p.providerName}</strong>
                  <span className="muted">
                    {p.distanceKm} km · kb. {p.estimatedArrivalMinutes} perc ·{" "}
                    {p.ratingAvg ? `${p.ratingAvg.toFixed(1)} ★` : "Nincs értékelés"}
                  </span>
                </div>
                <span className="muted">~{p.calloutFee} Ft kiszállás</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {jobRequest.status === "OPEN" && jobRequest.urgency === "PLANNED" && (
        <section>
          <h2>Beérkezett ajánlatok</h2>
          <p className="subtitle">
            Több szakember is küldhet árajánlatot. Hasonlítsd össze az árat, az időtartamot és az értékelést, majd
            válassz.
          </p>
          {acceptError && <p className="error">{acceptError}</p>}
          {quotes === null && <ListSkeleton rows={2} />}
          {quotes && quotes.length === 0 && <p>Még nem érkezett ajánlat.</p>}
          {quotes && quotes.length > 0 && (
            <MapView
              center={{ latitude: jobRequest.latitude, longitude: jobRequest.longitude }}
              zoom={12}
              markers={[
                {
                  id: "job",
                  latitude: jobRequest.latitude,
                  longitude: jobRequest.longitude,
                  emoji: "🏠",
                  label: "A munka helyszíne",
                  variant: "primary",
                },
                ...quotes
                  .filter((q) => q.provider)
                  .map<MapMarkerSpec>((q) => ({
                    id: q.id,
                    latitude: q.provider!.latitude,
                    longitude: q.provider!.longitude,
                    emoji: TRADE_ICONS[jobRequest.trade],
                    label: q.provider!.user?.name ?? "Szolgáltató",
                    popup: (
                      <div className="map-popup">
                        <strong>{q.provider!.user?.name}</strong>
                        {q.price} Ft · kb. {Math.round(q.estimatedDurationMinutes / 60)} óra
                      </div>
                    ),
                  })),
              ]}
            />
          )}
          <div className="list">
            {quotes?.map((q, idx) => (
              <div key={q.id} className={`quote-card ${idx === 0 ? "best" : ""}`}>
                <div className="row-between">
                  <strong>{q.provider?.user?.name}</strong>
                  <span>{q.price} Ft</span>
                </div>
                <span className="muted">
                  kb. {Math.round(q.estimatedDurationMinutes / 60)} óra ·{" "}
                  {q.provider?.ratingAvg ? `${q.provider.ratingAvg.toFixed(1)} ★` : "Nincs értékelés"}
                  {q.proposedStartAt && ` · javasolt időpont: ${new Date(q.proposedStartAt).toLocaleString("hu-HU")}`}
                </span>
                {q.message && <p className="muted">"{q.message}"</p>}
                <button onClick={() => handleAcceptQuote(q.id)} disabled={acceptingId === q.id}>
                  {acceptingId === q.id ? "..." : "Elfogadom ezt az ajánlatot"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {booking && (
        <section>
          <h2>Foglalás</h2>
          <p>
            Szakember: <strong>{booking.provider?.user.name}</strong> ({booking.provider?.user.phone})
          </p>
          {booking.scheduledAt && <p>Egyeztetett időpont: {new Date(booking.scheduledAt).toLocaleString("hu-HU")}</p>}
          <p>
            Állapot:{" "}
            <span className={`badge status-${booking.status.toLowerCase()}`}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </p>

          <MapView
            center={{ latitude: jobRequest.latitude, longitude: jobRequest.longitude }}
            zoom={14}
            height={180}
            markers={[
              {
                id: "job",
                latitude: jobRequest.latitude,
                longitude: jobRequest.longitude,
                emoji: TRADE_ICONS[jobRequest.trade],
                label: jobRequest.address,
                variant: "primary",
              },
            ]}
          />

          <Chat bookingId={booking.id} />

          {booking.payment && (
            <PaymentBox payment={booking.payment} canPay={true} onPaid={refresh} />
          )}

          {booking.status === "COMPLETED" && booking.payment?.status === "PAID" && (
            <ReviewForm bookingId={booking.id} revieweeLabel={booking.provider?.user.name ?? "a szakember"} />
          )}
        </section>
      )}
    </div>
  );
}
