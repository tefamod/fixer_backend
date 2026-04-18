const express = require("express");
const router = express.Router();
const { addClient, removeClient } = require("./sseService");

// GET /SSE/verify?email=...
router.get("/verify", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).end();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const heartbeat = setInterval(() => res.write(`: ping\n\n`), 25000);
  addClient(email, res);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(email);
  });
});

module.exports = router;
