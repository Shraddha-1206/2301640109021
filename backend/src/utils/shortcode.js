const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateShortcode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return s;
}

function isValidShortcode(s) {
  return /^[a-zA-Z0-9]{3,20}$/.test(s);
}

module.exports = { generateShortcode, isValidShortcode };
