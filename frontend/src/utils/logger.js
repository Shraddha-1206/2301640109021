// frontend/src/utils/logger.js
export async function clientLog(stack, level, pkg, message) {
  try {
    const payload = {
      stack: String(stack).toLowerCase(),
      level: String(level).toLowerCase(),
      package: pkg,
      message
    };
    const resp = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.warn("clientLog failed:", resp.status, text);
      return { ok: false, status: resp.status, text };
    }
    const json = await resp.json();
    return { ok: true, data: json };
  } catch (err) {
    console.error("clientLog exception:", err);
    return { ok: false, error: err.message || err };
  }
}
