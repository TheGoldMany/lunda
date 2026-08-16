import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import type { Booking, JobRequest, RankedProvider } from "../../api/types";
import { BOOKING_STATUS_LABELS, JOB_STATUS_LABELS, TRADE_ICONS, TRADE_LABELS } from "../../lib/labels";
import { ReviewForm } from "../../components/ReviewForm";

export function JobRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
  const [providers, setProviders] = useState<RankedProvider[] | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  async function refresh() {
    if (!id) return;
    const jr = await api.get<JobRequest>(`/job-requests/${id}`);
    setJobRequest(jr);

    if (jr.status === "OPEN") {
      setProviders(await api.get<RankedProvider[]>(`/job-requests/${id}/providers`));
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

      {jobRequest.status === "OPEN" && (
        <section>
          <h2>Elérhető szakemberek</h2>
          <p className="subtitle">Értesítettük a legközelebbi verifikált szakembereket. Amint valaki elfogadja, itt fog megjelenni.</p>
          {providers && providers.length === 0 && <p>Jelenleg nincs elérhető szakember ebben a szakágban.</p>}
          <ul className="list">
            {providers?.map((p) => (
              <li key={p.id} className="list-item">
                <div className="list-item-body">
                  <strong>{p.providerName}</strong>
                  <span className="muted">
                    {p.distanceKm} km · kb. {p.estimatedArrivalMinutes} perc · {p.ratingAvg ? `${p.ratingAvg.toFixed(1)} ★` : "Nincs értékelés"}
                  </span>
                </div>
                <span className="muted">~{p.calloutFee} Ft kiszállás</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {booking && (
        <section>
          <h2>Foglalás</h2>
          <p>
            Szakember: <strong>{booking.provider?.user.name}</strong> ({booking.provider?.user.phone})
          </p>
          <p>
            Állapot: <span className={`badge status-${booking.status.toLowerCase()}`}>{BOOKING_STATUS_LABELS[booking.status]}</span>
          </p>
          {booking.finalPrice && <p>Végösszeg: {booking.finalPrice} Ft</p>}

          {booking.status === "COMPLETED" && <ReviewForm bookingId={booking.id} revieweeLabel={booking.provider?.user.name ?? "a szakember"} />}
        </section>
      )}
    </div>
  );
}
