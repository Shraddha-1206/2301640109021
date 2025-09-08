// backend/src/controllers/redirectController.js
const { getEntry, addClick } = require("../models/storage");
const { Log } = require("../utils/logger");

async function redirectToOriginal(req, res) {
  const shortcode = req.params.shortcode;
  const entry = getEntry(shortcode);
  if (!entry) {
    await Log("backend", "warn", "service", `Redirect attempted for unknown shortcode: ${shortcode}`);
    return res.status(404).send("Shortcode not found");
  }
  const now = new Date();
  if (new Date(entry.expiry) <= now) {
    await Log("backend", "warn", "service", `Redirect attempted for expired shortcode: ${shortcode}`);
    return res.status(410).send("Link expired");
  }

  // track click: timestamp, referrer, ip
  const click = {
    ts: new Date().toISOString(),
    referrer: req.get("referer") || null,
    ip: req.ip || req.connection.remoteAddress || null
  };
  addClick(shortcode, click);
  await Log("backend", "info", "service", `Redirect for ${shortcode} tracked (ip: ${click.ip})`);
  return res.redirect(entry.url);
}

module.exports = { redirectToOriginal };
