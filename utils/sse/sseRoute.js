const express = require("express");
const router = express.Router();
const { addClient, removeClient } = require("./sseService");

router.get("/verify", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).end();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const heartbeat = setInterval(() => res.write(`: ping\n\n`), 25000);

  // ⏰ Auto-close after 15 minutes
  const timeout = setTimeout(
    () => {
      res.write(`data: ${JSON.stringify({ status: "timeout" })}\n\n`);
      cleanup();
      res.end();
    },
    15 * 60 * 1000,
  );

  const cleanup = () => {
    clearInterval(heartbeat);
    clearTimeout(timeout);
    removeClient(email);
  };

  addClient(email, res);

  req.on("close", cleanup);
});

module.exports = router;
