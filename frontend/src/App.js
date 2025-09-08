// frontend/src/App.js
import React, { useState } from "react";
import { clientLog } from "./utils/logger";

function isValidUrl(value) {
  try { new URL(value); return true; } catch { return false; }
}

export default function App() {
  const [inputs, setInputs] = useState([{ url: "", validity: 30, shortcode: "" }]);
  const [results, setResults] = useState([]);

  function updateInput(i, field, value) {
    const arr = [...inputs];
    arr[i][field] = value;
    setInputs(arr);
  }

  function addRow() {
    if (inputs.length >= 5) return;
    setInputs([...inputs, { url: "", validity: 30, shortcode: "" }]);
  }

  async function submitAll() {
    const out = [];
    for (const item of inputs) {
      if (!item.url || !isValidUrl(item.url)) {
        await clientLog("frontend", "warn", "component", "Invalid URL attempted from UI");
        out.push({ ok: false, error: "Invalid URL" });
        continue;
      }
      // call backend
      const resp = await fetch("/shortUrls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: item.url,
          validity: Number(item.validity) || undefined,
          shortcode: item.shortcode || undefined
        }),
      });
      const json = await resp.json();
      out.push({ ok: resp.status === 201, status: resp.status, body: json });
      // log the event
      const logMsg = resp.status === 201 ? `Created short link: ${json.shortLink}` : `Failed create: ${JSON.stringify(json)}`;
      await clientLog("frontend", resp.status === 201 ? "info" : "warn", "component", logMsg);
    }
    setResults(out);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>URL Shortener</h1>
      {inputs.map((it, i) => (
        <div key={i} style={{ marginBottom: 12, border: "1px solid #ddd", padding: 12 }}>
          <div>
            <label>Long URL</label><br/>
            <input style={{ width: "100%" }} value={it.url} onChange={e => updateInput(i, "url", e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Validity (minutes)</label><br/>
            <input type="number" value={it.validity} onChange={e => updateInput(i, "validity", e.target.value)} />
            <small style={{ marginLeft: 8 }}>Defaults to 30</small>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Custom shortcode (optional)</label><br/>
            <input value={it.shortcode} onChange={e => updateInput(i, "shortcode", e.target.value)} />
          </div>
        </div>
      ))}
      <button onClick={addRow} disabled={inputs.length >= 5}>Add URL (max 5)</button>
      <button onClick={submitAll} style={{ marginLeft: 12 }}>Shorten</button>

      <h2>Results</h2>
      <ul>
        {results.map((r, idx) => (
          <li key={idx}>
            {r.ok ? <span style={{ color: "green" }}>{r.body.shortLink} (expires: {r.body.expiry})</span>
                 : <span style={{ color: "red" }}>{JSON.stringify(r.body || r.error)}</span>}
          </li>
        ))}
      </ul>

      <hr/>
      <h3>Get Stats</h3>
      <StatsForm />
    </div>
  );
}

function StatsForm() {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState(null);

  async function fetchStats() {
    const resp = await fetch(`/shortUrls/${encodeURIComponent(code)}`);
    if (!resp.ok) {
      const txt = await resp.text();
      setStats({ ok: false, status: resp.status, text: txt });
      await clientLog("frontend", "warn", "component", `Failed stats fetch for ${code}`);
      return;
    }
    const json = await resp.json();
    setStats({ ok: true, data: json });
    await clientLog("frontend", "info", "component", `Fetched stats for ${code}`);
  }

  return (
    <div>
      <input placeholder="shortcode (e.g. abcd1)" value={code} onChange={e => setCode(e.target.value)} />
      <button onClick={fetchStats} style={{ marginLeft: 8 }}>Fetch Stats</button>

      {stats && (
        <div style={{ marginTop: 12 }}>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
