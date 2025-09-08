// backend/src/controllers/shortController.js
const { addShortcode, getEntry } = require("../models/storage");
const { Log } = require("../utils/logger");
const { generateShortcode, isValidShortcode } = require("../utils/shortcode");

function isoNowPlusMinutes(mins) {
  const dt = new Date(Date.now() + mins * 60 * 1000);
  return dt.toISOString();
}

function validateUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

async function createShortUrl(req, res) {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url || !validateUrl(url)) {
      await Log("backend", "error", "handler", "CreateShortUrl invalid or missing url");
      return res.status(400).json({ error: "Invalid or missing 'url' (must be valid URL)" });
    }

    const validityMinutes = (typeof validity === "number" && validity > 0) ? validity : 30;

    // custom shortcode handling
    let code = shortcode ? String(shortcode).trim() : generateShortcode();
    if (shortcode) {
      // validate allowed characters (alphanumeric), length
      if (!isValidShortcode(code)) {
        await Log("backend", "warn", "handler", `Invalid shortcode attempt: ${code}`);
        return res.status(400).json({ error: "Invalid shortcode. Allowed: alphanumeric, 3-20 chars." });
      }
      // reject if exists
      if (getEntry(code)) {
        await Log("backend", "warn", "handler", `Shortcode collision for custom code: ${code}`);
        return res.status(409).json({ error: "Shortcode already in use" });
      }
    } else {
      // auto-generate unique
      while (getEntry(code)) code = generateShortcode();
    }

    const createdAt = new Date().toISOString();
    const expiry = isoNowPlusMinutes(validityMinutes);

    const entry = {
      url,
      createdAt,
      expiry,
      clicks: []
    };

    addShortcode(code, entry);

    await Log("backend", "info", "service", `Short URL created: ${code}`);

    const shortLink = `${req.protocol}://${req.get("host")}/${code}`;
    res.status(201).json({ shortLink, expiry });
  } catch (err) {
    await Log("backend", "error", "service", `CreateShortUrl failed: ${err.message || err}`);
    res.status(500).json({ error: "Failed to create short URL" });
  }
}

async function getStats(req, res) {
  try {
    const { shortcode } = req.params;
    const entry = getEntry(shortcode);
    if (!entry) {
      await Log("backend", "warn", "service", `Stats requested for unknown shortcode: ${shortcode}`);
      return res.status(404).json({ error: "Shortcode not found" });
    }
    const response = {
      shortcode,
      url: entry.url,
      createdAt: entry.createdAt,
      expiry: entry.expiry,
      clickCount: entry.clicks.length,
      clicks: entry.clicks
    };
    await Log("backend", "info", "service", `Stats returned for ${shortcode}`);
    return res.status(200).json(response);
  } catch (err) {
    await Log("backend", "error", "service", `getStats failed: ${err.message || err}`);
    res.status(500).json({ error: "Failed to retrieve stats" });
  }
}

module.exports = { createShortUrl, getStats };
