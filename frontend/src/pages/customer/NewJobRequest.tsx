import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { JobRequest, Trade } from "../../api/types";
import { TRADE_ICONS, TRADE_LABELS } from "../../lib/labels";

const BUDAPEST_CENTER = { latitude: 47.4979, longitude: 19.0402 };
const TRADES: Trade[] = ["WATER", "GAS", "ELECTRICITY"];

export function NewJobRequestPage() {
  const navigate = useNavigate();
  const [trade, setTrade] = useState<Trade>("WATER");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(BUDAPEST_CENTER.latitude);
  const [longitude, setLongitude] = useState(BUDAPEST_CENTER.longitude);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      () => {
        // Geolocation denied/unavailable — keep the Budapest center default.
      }
    );
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const jobRequest = await api.post<JobRequest>("/job-requests", {
        trade,
        description,
        address,
        latitude,
        longitude,
      });
      navigate(`/customer/requests/${jobRequest.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült létrehozni a kérést");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Sürgős munka igénylése</h1>
      <p className="subtitle">Írd le röviden a problémát, és megmutatjuk a legközelebbi elérhető szakembereket.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>Válaszd ki a szakágat</label>
        <div className="trade-picker">
          {TRADES.map((t) => (
            <button
              type="button"
              key={t}
              className={`trade-option ${trade === t ? "selected" : ""}`}
              onClick={() => setTrade(t)}
            >
              <span className="trade-icon">{TRADE_ICONS[t]}</span>
              {TRADE_LABELS[t]}
            </button>
          ))}
        </div>

        <label>
          Mi a probléma?
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Pl. csöpög a csap a konyhában, kb. 20 perce folyamatosan."
            rows={4}
            required
          />
        </label>

        <label>
          Cím
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Utca, házszám" required />
        </label>

        <details>
          <summary>Helyszín pontosítása (koordináták)</summary>
          <div className="coord-row">
            <label>
              Szélesség
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
              />
            </label>
            <label>
              Hosszúság
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
              />
            </label>
          </div>
        </details>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Küldés..." : "Szakemberek keresése"}
        </button>
      </form>
    </div>
  );
}
