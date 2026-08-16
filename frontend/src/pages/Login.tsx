import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";
import { roleHome } from "../lib/roleHome";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(phone, password);
      navigate(roleHome(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sikertelen bejelentkezés");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card narrow">
      <h1>Bejelentkezés</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Telefonszám
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+3620..." required />
        </label>
        <label>
          Jelszó
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Belépés..." : "Belépés"}
        </button>
      </form>
    </div>
  );
}
