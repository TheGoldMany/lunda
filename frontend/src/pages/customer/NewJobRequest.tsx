import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { JobRequest, Trade, Urgency } from "../../api/types";
import { TRADE_LABELS } from "../../lib/labels";
import { MapView } from "../../components/MapView";
import { compressImageToDataUrl } from "../../lib/image";
import { TradeIcon, LocateFixed, Camera, X } from "../../lib/icons";

const BUDAPEST_CENTER = { latitude: 47.4979, longitude: 19.0402 };
const TRADES: Trade[] = ["WATER", "GAS", "ELECTRICITY"];

function defaultDateInput(daysFromNow: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export function NewJobRequestPage() {
  const navigate = useNavigate();
  const [urgency, setUrgency] = useState<Urgency>("URGENT");
  const [trade, setTrade] = useState<Trade>("WATER");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(BUDAPEST_CENTER.latitude);
  const [longitude, setLongitude] = useState(BUDAPEST_CENTER.longitude);
  const [mapCenter, setMapCenter] = useState(BUDAPEST_CENTER);
  const [locating, setLocating] = useState(false);
  const [preferredStartAt, setPreferredStartAt] = useState(defaultDateInput(3, 8));
  const [preferredEndAt, setPreferredEndAt] = useState(defaultDateInput(7, 18));
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    setProcessingPhoto(true);
    try {
      setPhotoUrl(await compressImageToDataUrl(file));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Nem sikerült feldolgozni a képet");
    } finally {
      setProcessingPhoto(false);
    }
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLatitude(here.latitude);
        setLongitude(here.longitude);
        setMapCenter(here);
        setLocating(false);
      },
      () => {
        // Geolocation denied/unavailable/timed out — keep the Budapest center default.
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  useEffect(() => {
    locateMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const jobRequest = await api.post<JobRequest>("/job-requests", {
        trade,
        description,
        photoUrl: photoUrl ?? undefined,
        address,
        latitude,
        longitude,
        urgency,
        preferredStartAt: urgency === "PLANNED" ? new Date(preferredStartAt).toISOString() : undefined,
        preferredEndAt: urgency === "PLANNED" ? new Date(preferredEndAt).toISOString() : undefined,
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
      <h1>Munka igénylése</h1>
      <p className="subtitle">Írd le röviden a problémát, és megmutatjuk a legközelebbi elérhető szakembereket.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>Mikorra kell?</label>
        <div className="urgency-picker">
          <button
            type="button"
            className={`urgency-option ${urgency === "URGENT" ? "selected" : ""}`}
            onClick={() => setUrgency("URGENT")}
          >
            <strong>Most azonnal</strong>
            <span className="muted">Sürgős hiba, azonnal kell valaki</span>
          </button>
          <button
            type="button"
            className={`urgency-option ${urgency === "PLANNED" ? "selected" : ""}`}
            onClick={() => setUrgency("PLANNED")}
          >
            <strong>Tervezem, van rá időm</strong>
            <span className="muted">Több ajánlatot is bekérek, összehasonlítom</span>
          </button>
        </div>

        <label>Válaszd ki a szakágat</label>
        <div className="trade-picker">
          {TRADES.map((t) => (
            <button
              type="button"
              key={t}
              className={`trade-option ${trade === t ? "selected" : ""}`}
              onClick={() => setTrade(t)}
            >
              <TradeIcon trade={t} size={22} strokeWidth={1.75} />
              {TRADE_LABELS[t]}
            </button>
          ))}
        </div>

        <label>
          Mi a probléma?
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              urgency === "URGENT"
                ? "Pl. csöpög a csap a konyhában, kb. 20 perce folyamatosan."
                : "Pl. fürdőszoba-felújítás: csövek és szerelvények cseréje, kb. 6 nm-en."
            }
            rows={4}
            required
          />
        </label>

        <div>
          <label>Fotó (opcionális)</label>
          {photoUrl ? (
            <div className="photo-preview">
              <img src={photoUrl} alt="Feltöltött fotó előnézete" />
              <button
                type="button"
                className="icon-button"
                onClick={() => setPhotoUrl(null)}
                aria-label="Fotó eltávolítása"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <label className={`upload-dropzone ${processingPhoto ? "disabled" : ""}`}>
              <Camera size={20} strokeWidth={1.75} />
              <span>{processingPhoto ? "Feldolgozás..." : "Fotó feltöltése"}</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={processingPhoto} hidden />
            </label>
          )}
          {photoError && <p className="error">{photoError}</p>}
        </div>

        <label>
          Cím
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Utca, házszám" required />
        </label>

        {urgency === "PLANNED" && (
          <div className="coord-row">
            <label>
              Legkorábban
              <input
                type="datetime-local"
                value={preferredStartAt}
                onChange={(e) => setPreferredStartAt(e.target.value)}
                required
              />
            </label>
            <label>
              Legkésőbb
              <input
                type="datetime-local"
                value={preferredEndAt}
                onChange={(e) => setPreferredEndAt(e.target.value)}
                required
              />
            </label>
          </div>
        )}

        <div>
          <div className="row-between">
            <label>Pontos helyszín a térképen</label>
            <button type="button" className="link-button icon-label-button" onClick={locateMe} disabled={locating}>
              <LocateFixed size={14} strokeWidth={2} />
              {locating ? "Keresés..." : "Saját helyzetem"}
            </button>
          </div>
          <MapView
            center={mapCenter}
            zoom={14}
            height={280}
            pickedLocation={{ latitude, longitude }}
            onPick={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
            onPickedDrag={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
            recenterOnCenterChange
          />
          <p className="map-hint">Kattints a térképre, vagy húzd a jelölőt a pontos helyszínre.</p>
        </div>

        <details>
          <summary>Koordináták kézzel</summary>
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
          {loading
            ? "Küldés..."
            : urgency === "URGENT"
              ? "Szakemberek keresése"
              : "Ajánlatkérés elküldése"}
        </button>
      </form>
    </div>
  );
}
