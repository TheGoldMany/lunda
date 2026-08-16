import { useState } from "react";
import { api, ApiError } from "../api/client";
import type { Payment } from "../api/types";

export function PaymentBox({
  payment,
  canPay,
  onPaid,
}: {
  payment: Payment;
  canPay: boolean;
  onPaid: () => void;
}) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setPaying(true);
    try {
      await api.post(`/payments/${payment.id}/pay`);
      onPaid();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nem sikerült a fizetés");
    } finally {
      setPaying(false);
    }
  }

  if (payment.status === "PAID") {
    return <p className="success">Kifizetve: {payment.amount} Ft</p>;
  }

  return (
    <div className="payment-box">
      <p>
        Fizetendő: <strong>{payment.amount} Ft</strong>
      </p>
      {canPay ? (
        <>
          <button onClick={handlePay} disabled={paying}>
            {paying ? "Fizetés..." : "Fizetés (teszt mód)"}
          </button>
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <p className="muted">A megrendelő fizetésére várunk.</p>
      )}
    </div>
  );
}
