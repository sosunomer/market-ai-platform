import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Instrument, type Market } from "../api";

export default function Dashboard() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [activeMarket, setActiveMarket] = useState<number | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const ms = await api.markets();
        setMarkets(ms);
        if (ms.length) setActiveMarket(ms[0].id);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeMarket == null) return;
    void (async () => {
      try {
        const xs = await api.instruments(activeMarket, search || undefined);
        setInstruments(xs);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, [activeMarket, search]);

  return (
    <>
      <h1>Markets</h1>
      {err && <div className="error">{err}</div>}
      <div className="card">
        <div className="row">
          <div>
            <label className="muted">Market</label>
            <select
              value={activeMarket ?? ""}
              onChange={(e) => setActiveMarket(Number(e.target.value))}
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.country}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="muted">Search</label>
            <input
              placeholder="AAPL, Apple, BTC…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid">
        {instruments.map((i) => (
          <Link key={i.id} to={`/instrument/${i.id}`} className="instrument-item">
            <div>
              <div style={{ fontWeight: 700 }}>{i.symbol}</div>
              <div className="muted">{i.name}</div>
            </div>
            <span className="pill">{i.sector || i.kind}</span>
          </Link>
        ))}
      </div>
      {instruments.length === 0 && <p className="muted">No instruments found.</p>}
    </>
  );
}
