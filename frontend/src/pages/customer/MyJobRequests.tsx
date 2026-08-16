import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { JobRequest } from "../../api/types";
import { JOB_STATUS_LABELS, TRADE_ICONS, TRADE_LABELS } from "../../lib/labels";
import { ListSkeleton } from "../../components/Skeleton";

export function MyJobRequestsPage() {
  const [requests, setRequests] = useState<JobRequest[] | null>(null);

  useEffect(() => {
    api.get<JobRequest[]>("/job-requests/me").then(setRequests);
  }, []);

  return (
    <div className="card">
      <div className="row-between">
        <h1>Munkáim</h1>
        <Link to="/customer/new-request" className="btn-link">
          + Új munka
        </Link>
      </div>
      {requests === null && <ListSkeleton />}
      {requests?.length === 0 && <p className="subtitle">Még nincs leadott munkád.</p>}
      <ul className="list">
        {requests?.map((r) => (
          <li key={r.id}>
            <Link to={`/customer/requests/${r.id}`} className="list-item">
              {r.photoUrl ? (
                <img className="job-photo-thumb" src={r.photoUrl} alt="" />
              ) : (
                <span className="trade-icon">{TRADE_ICONS[r.trade]}</span>
              )}
              <div className="list-item-body">
                <strong>{TRADE_LABELS[r.trade]}</strong>
                <span className="muted">{r.description}</span>
              </div>
              <span className={`badge status-${r.status.toLowerCase()}`}>{JOB_STATUS_LABELS[r.status]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
