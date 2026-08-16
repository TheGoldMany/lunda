import { useState, type FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { Star, CheckCircle2 } from "../lib/icons";

export function ReviewForm({ bookingId, revieweeLabel }: { bookingId: string; revieweeLabel: string }) {
  const [score, setScore] = useState(5);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/reviews", { bookingId, score, text: text || undefined });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitted(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Nem sikerült elküldeni az értékelést");
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted)
    return (
      <p className="success">
        <CheckCircle2 size={16} strokeWidth={2} /> Köszönjük az értékelést!
      </p>
    );

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>Értékeld: {revieweeLabel}</label>
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={`star ${n <= score ? "filled" : ""}`}
            onClick={() => setScore(n)}
            aria-label={`${n} pont`}
          >
            <Star size={22} strokeWidth={1.5} fill={n <= score ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <label>
        Megjegyzés (opcionális)
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Küldés..." : "Értékelés küldése"}
      </button>
    </form>
  );
}
