const express = require("express");
const router = express.Router();
const { Log } = require("../utils/logger");

router.post("/", async (req, res) => {
  const { stack, level, package: pkg, message } = req.body;
  if (!stack || !level || !pkg || !message) {
    return res.status(400).json({ error: "stack, level, package and message required" });
  }
  const out = await Log(stack, level, pkg, message);
  if (out.ok) return res.status(200).json({ success: true, data: out.data });
  return res.status(500).json({ success: false, error: out.error });
});

module.exports = router;
