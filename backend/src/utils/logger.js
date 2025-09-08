const axios = require("axios");
require("dotenv").config();

const AUTH_URL = process.env.AUTH_URL;
const LOG_URL = process.env.LOG_URL;

let cachedToken = null;
let tokenExpiry = 0;

async function requestAccessToken() {
  const payload = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  };

  const resp = await axios.post(AUTH_URL, payload, { timeout: 8000 });
  return resp.data.access_token;
}

async function ensureToken() {
  const now = Date.now();
  if (!cachedToken || now >= tokenExpiry - 60 * 1000) { // refresh 1min before expiry
    try {
      const tok = await requestAccessToken();
      cachedToken = tok;
      // The real expiry lives in token payload or response; set a conservative expiry 50 minutes from now
      tokenExpiry = now + 50 * 60 * 1000;
    } catch (err) {
      console.error("Auth failed:", err.response?.data || err.message);
      throw err;
    }
  }
}

async function Log(stack, level, pkg, message) {
  const payload = {
    stack: String(stack).toLowerCase(),
    level: String(level).toLowerCase(),
    package: String(pkg),
    message: String(message),
  };

  try {
    await ensureToken();
    const resp = await axios.post(LOG_URL, payload, {
      headers: { Authorization: `Bearer ${cachedToken}`, "Content-Type": "application/json" },
      timeout: 8000,
    });
    return { ok: true, data: resp.data };
  } catch (err) {
    // return error info for debugging (do not leak secrets)
    return { ok: false, error: err.response?.data || err.message };
  }
}

module.exports = { Log };
