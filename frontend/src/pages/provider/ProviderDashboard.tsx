import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { Booking, IncomingJobRequest, ServiceProviderProfile } from "../../api/types";
import { BOOKING_STATUS_LABELS, TRADE_LABELS } from "../../lib/labels";
import { ReviewForm } from "../../components/ReviewForm";
import { Chat } from "../../components/Chat";
import { PaymentBox } from "../../components/PaymentBox";
import { MapView, type MapMarkerSpec } from "../../components/MapView";
import { ListSkeleton } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import { TradeBadge, tradePinIcon } from "../../lib/icons";

export function ProviderDashboardPage() {
  const { showToast } = useToast();
  const [incoming, setIncoming] = useState<IncomingJobRequest[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function refresh() {
    const [inc, bks, prof] = await Promise.all([
      api.get<IncomingJobRequest[]>("/bookings/incoming"),
      api.get<Booking[]>("/bookings/me"),
      api.get<ServiceProviderProfile>("/providers/me").catch(() => null),
    ]);
    setIncoming(inc);
    setBookings(bks);
    setProfile(prof);
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
      showToast("Munka elfogadva!");
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült elfogadni a munkát");
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleToggleAvailability() {
    if (!profile) return;
    const next = !profile.isAvailable;
    setProfile({ ...profile, isAvailable: next });
    try {
      await api.patch("/providers/me/availability", { isAvailable: next });
      showToast(next ? "Most elérhető vagy az új munkákra." : "Elrejtve az új munkák elől.");
    } catch (err) {
      setProfile(profile);
      setError(err instanceof ApiError ? err.message : "Nem sikerült frissíteni az elérhetőséget");
    }
  }

  return (
    <div className="card">
      <div className="row-between">
        <h1>Munkák</h1>
        {profile && (
          <label className="availability-toggle">
            <input type="checkbox" checked={profile.isAvailable} onChange={handleToggleAvailability} />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            {profile.isAvailable ? "Elérhető vagyok" : "Nem vagyok elérhető"}
          </label>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      <section>
        <h2>Beérkező munkák</h2>
        {incoming === null && <ListSkeleton />}
        {incoming?.length === 0 && <p className="subtitle">Jelenleg nincs hozzád illő nyitott munka.</p>}
        {incoming && incoming.length > 0 && (
          <MapView
            center={profile ? { latitude: profile.latitude, longitude: profile.longitude } : incoming[0]}
            zoom={12}
            markers={[
              ...(profile
                ? [
                    {
                      id: "me",
                      latitude: profile.latitude,
                      longitude: profile.longitude,
                      icon: "provider" as const,
                      label: "Én",
                      variant: "primary" as const,
                    },
                  ]
                : []),
              ...incoming.map<MapMarkerSpec>((jr) => ({
                id: jr.id,
                latitude: jr.latitude,
                longitude: jr.longitude,
                icon: tradePinIcon(jr.trade),
                label: jr.customer.name,
                popup: (
                  <div className="map-popup">
                    <strong>{TRADE_LABELS[jr.trade]}</strong>
                    {jr.description}
                    <br />
                    {jr.distanceKm} km · kb. {jr.estimatedArrivalMinutes} perc
                    <br />
                    <button onClick={() => handleAccept(jr.id)} disabled={acceptingId === jr.id}>
                      {acceptingId === jr.id ? "..." : "Elfogadom"}
                    </button>
                  </div>
                ),
              })),
            ]}
          />
        )}
        <ul className="list">
          {incoming?.map((jr) => (
            <li key={jr.id} className="list-item">
              {jr.photoUrl ? (
                <img className="job-photo-thumb" src={jr.photoUrl} alt="" />
              ) : (
                <TradeBadge trade={jr.trade} />
              )}
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
        {bookings === null && <ListSkeleton />}
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
  const { showToast } = useToast();
  const [finalPrice, setFinalPrice] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setError(null);
    setCompleting(true);
    try {
      await api.patch(`/bookings/${booking.id}/complete`, { finalPrice });
      showToast("Munka lezárva, fizetésre vár.");
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
          {booking.scheduledAt && (
            <span className="muted">Egyeztetett időpont: {new Date(booking.scheduledAt).toLocaleString("hu-HU")}</span>
          )}
        </div>
        <span className={`badge status-${booking.status.toLowerCase()}`}>{BOOKING_STATUS_LABELS[booking.status]}</span>
      </div>

      {booking.jobRequest && (
        <MapView
          center={{ latitude: booking.jobRequest.latitude, longitude: booking.jobRequest.longitude }}
          zoom={14}
          height={160}
          markers={[
            {
              id: "job",
              latitude: booking.jobRequest.latitude,
              longitude: booking.jobRequest.longitude,
              icon: tradePinIcon(booking.jobRequest.trade),
              label: booking.jobRequest.address,
              variant: "primary",
            },
          ]}
        />
      )}

      <Chat bookingId={booking.id} />

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

      {booking.payment && <PaymentBox payment={booking.payment} canPay={false} onPaid={onChanged} />}

      {booking.status === "COMPLETED" && booking.payment?.status === "PAID" && (
        <ReviewForm bookingId={booking.id} revieweeLabel={booking.jobRequest?.customer?.name ?? "a megrendelő"} />
      )}
    </li>
  );
}
