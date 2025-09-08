const fs = require("fs");
const path = require("path");
const PERSIST_FILE = path.join(__dirname, "..", "..", "data", "store.json");

const store = {
  urls: {}
};

function loadFromDisk() {
  try {
    if (fs.existsSync(PERSIST_FILE)) {
      const raw = fs.readFileSync(PERSIST_FILE, "utf8");
      const parsed = JSON.parse(raw);
      Object.assign(store, parsed);
    }
  } catch (err) {
    console.warn("Could not load persistence:", err.message);
  }
}

function saveToDisk() {
  try {
    const dir = path.dirname(PERSIST_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PERSIST_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not save persistence:", err.message);
  }
}

function addShortcode(code, entry, persist = true) {
  store.urls[code] = entry;
  if (persist) saveToDisk();
}

function getEntry(code) { return store.urls[code]; }

function addClick(code, click, persist = true) {
  const e = store.urls[code];
  if (!e) return false;
  e.clicks.push(click);
  if (persist) saveToDisk();
  return true;
}

function listAll() {
  return store.urls;
}

loadFromDisk();

module.exports = { addShortcode, getEntry, addClick, listAll, saveToDisk };
