import { useEffect, useState } from "react";
import { api, type SubscriptionStatus } from "../api";
import { useAuth } from "../auth";

export default function Billing() {
  const { refresh } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setStatus(await api.subscriptionStatus());
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const upgrade = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await api.checkout();
      if (r.mocked) {
        await refresh();
        await load();
      } else {
        window.location.href = r.url;
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h2>Billing</h2>
      {err && <div className="error">{err}</div>}
      {status && (
        <>
          <p>
            Plan: <strong>{status.plan}</strong>{" "}
            <span className="pill">{status.active ? "active" : "inactive"}</span>
          </p>
          {status.mocked && <p className="muted">Stripe is in mock mode (no API key set).</p>}
          {!status.active && (
            <button disabled={busy} onClick={upgrade}>
              {busy ? "…" : "Upgrade — $15/month"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
