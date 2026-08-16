import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { Booking, IncomingJobRequest } from "../../api/types";
import { BOOKING_STATUS_LABELS, TRADE_ICONS, TRADE_LABELS } from "../../lib/labels";
import { ReviewForm } from "../../components/ReviewForm";

export function ProviderDashboardPage() {
  const [incoming, setIncoming] = useState<IncomingJobRequest[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function refresh() {
    const [inc, bks] = await Promise.all([
      api.get<IncomingJobRequest[]>("/bookings/incoming"),
      api.get<Booking[]>("/bookings/me"),
    ]);
    setIncoming(inc);
    setBookings(bks);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleAccept(jobRequestId: string) {
    setError(null);
    setAcceptingId(jobRequestId);
    try {
      await api.post("/bookings", { jobRequestId });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült elfogadni a munkát");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="card">
      <h1>Munkák</h1>
      {error && <p className="error">{error}</p>}

      <section>
        <h2>Beérkező munkák</h2>
        {incoming === null && <p>Betöltés...</p>}
        {incoming?.length === 0 && <p className="subtitle">Jelenleg nincs hozzád illő nyitott munka.</p>}
        <ul className="list">
          {incoming?.map((jr) => (
            <li key={jr.id} className="list-item">
              <span className="trade-icon">{TRADE_ICONS[jr.trade]}</span>
              <div className="list-item-body">
                <strong>{TRADE_LABELS[jr.trade]}</strong>
                <span className="muted">{jr.description}</span>
                <span className="muted">
                  {jr.customer.name} · {jr.distanceKm} km · kb. {jr.estimatedArrivalMinutes} perc
                </span>
              </div>
              <button onClick={() => handleAccept(jr.id)} disabled={acceptingId === jr.id}>
                {acceptingId === jr.id ? "..." : "Elfogadom"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Foglalásaim</h2>
        {bookings === null && <p>Betöltés...</p>}
        <ul className="list">
          {bookings?.map((b) => (
            <BookingRow key={b.id} booking={b} onChanged={refresh} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function BookingRow({ booking, onChanged }: { booking: Booking; onChanged: () => void }) {
  const [finalPrice, setFinalPrice] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setError(null);
    setCompleting(true);
    try {
      await api.patch(`/bookings/${booking.id}/complete`, { finalPrice });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült lezárni a munkát");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <li className="list-item column">
      <div className="row-between full-width">
        <div className="list-item-body">
          <strong>{booking.jobRequest ? TRADE_LABELS[booking.jobRequest.trade] : ""}</strong>
          <span className="muted">{booking.jobRequest?.customer?.name}</span>
          <span className="muted">{booking.jobRequest?.address}</span>
        </div>
        <span className={`badge status-${booking.status.toLowerCase()}`}>{BOOKING_STATUS_LABELS[booking.status]}</span>
      </div>

      {booking.status === "BOOKED" && (
        <div className="row complete-row">
          <input
            type="number"
            min={0}
            value={finalPrice}
            onChange={(e) => setFinalPrice(Number(e.target.value))}
            placeholder="Végösszeg (Ft)"
          />
          <button onClick={handleComplete} disabled={completing}>
            {completing ? "..." : "Munka lezárása"}
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}

      {booking.status === "COMPLETED" && (
        <ReviewForm bookingId={booking.id} revieweeLabel={booking.jobRequest?.customer?.name ?? "a megrendelő"} />
      )}
    </li>
  );
}
