import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";
import type { Role } from "../api/types";
import { roleHome } from "../lib/roleHome";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Budapest");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await register({ name, phone, password, city, role });
      navigate(roleHome(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sikertelen regisztráció");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card narrow">
      <h1>Regisztráció</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Vagyok...
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="CUSTOMER">Megrendelő</option>
            <option value="PROVIDER">Szolgáltató</option>
          </select>
        </label>
        <label>
          Név
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Telefonszám
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+3620..." required />
        </label>
        <label>
          Város
          <input value={city} onChange={(e) => setCity(e.target.value)} required />
        </label>
        <label>
          Jelszó
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Regisztráció..." : "Regisztráció"}
        </button>
      </form>
    </div>
  );
}
