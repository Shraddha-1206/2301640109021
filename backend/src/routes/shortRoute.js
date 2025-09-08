// backend/src/routes/shortRoute.js
const express = require("express");
const router = express.Router();
const { createShortUrl, getStats } = require("../controller/shortController");

router.post("/", createShortUrl);         // POST /shortUrls
router.get("/:shortcode", getStats);      // GET /shortUrls/:shortcode

module.exports = router;
