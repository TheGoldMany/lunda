import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../api/client";
import type { ServiceProviderProfile, Trade } from "../../api/types";
import { TRADE_ICONS, TRADE_LABELS, VERIFICATION_LABELS } from "../../lib/labels";

const BUDAPEST_CENTER = { latitude: 47.4979, longitude: 19.0402 };
const TRADES: Trade[] = ["WATER", "GAS", "ELECTRICITY"];

export function ProviderOnboardingPage() {
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [trades, setTrades] = useState<Trade[]>(["WATER"]);
  const [calloutFee, setCalloutFee] = useState(5000);
  const [hourlyRate, setHourlyRate] = useState(8000);
  const [licenseDocumentUrl, setLicenseDocumentUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<ServiceProviderProfile>("/providers/me")
      .then((p) => {
        setProfile(p);
        setTrades(p.trades);
        setCalloutFee(Number(p.calloutFee));
        setHourlyRate(Number(p.hourlyRate));
        setLicenseDocumentUrl(p.licenseDocumentUrl ?? "");
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function toggleTrade(t: Trade) {
    setTrades((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const saved = await api.post<ServiceProviderProfile>("/providers/me", {
        trades,
        calloutFee,
        hourlyRate,
        licenseDocumentUrl: licenseDocumentUrl || undefined,
        latitude: profile?.latitude ?? BUDAPEST_CENTER.latitude,
        longitude: profile?.longitude ?? BUDAPEST_CENTER.longitude,
      });
      setProfile(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült menteni a profilt");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p>Betöltés...</p>;

  return (
    <div className="card">
      <h1>Szolgáltatói profil</h1>
      {profile && (
        <p>
          Verifikációs állapot:{" "}
          <span className={`badge status-${profile.verificationStatus.toLowerCase()}`}>
            {VERIFICATION_LABELS[profile.verificationStatus]}
          </span>
        </p>
      )}
      {profile?.verificationStatus === "PENDING" && (
        <p className="subtitle">A profilod adminisztrátori jóváhagyásra vár. Addig nem jelensz meg a találatok között.</p>
      )}

      <form onSubmit={handleSubmit} className="form">
        <label>Szakág(ak)</label>
        <div className="trade-picker">
          {TRADES.map((t) => (
            <button
              type="button"
              key={t}
              className={`trade-option ${trades.includes(t) ? "selected" : ""}`}
              onClick={() => toggleTrade(t)}
            >
              <span className="trade-icon">{TRADE_ICONS[t]}</span>
              {TRADE_LABELS[t]}
            </button>
          ))}
        </div>

        <label>
          Kiszállási díj (Ft)
          <input type="number" value={calloutFee} onChange={(e) => setCalloutFee(Number(e.target.value))} min={0} />
        </label>
        <label>
          Óradíj (Ft)
          <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} min={0} />
        </label>
        <label>
          Végzettséget igazoló dokumentum URL-je
          <input
            value={licenseDocumentUrl}
            onChange={(e) => setLicenseDocumentUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={saving || trades.length === 0}>
          {saving ? "Mentés..." : profile ? "Profil frissítése" : "Regisztráció szolgáltatóként"}
        </button>
      </form>
    </div>
  );
}
