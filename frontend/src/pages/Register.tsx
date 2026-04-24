import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await register(email, password);
      navigate("/");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password (min 6 chars)</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          minLength={6}
          required
        />
        {err && <div className="error">{err}</div>}
        <button disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="muted" style={{ marginTop: 16 }}>
        Already have one? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
