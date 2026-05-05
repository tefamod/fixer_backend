const express = require("express");
const router = express.Router();
const { addClient, removeClient } = require("./sseService");

/**
 * @swagger
 * tags:
 *   name: SSE
 *   description: Server-Sent Events — real-time stream for email verification status
 */

/**
 * @swagger
 * /sse/verify:
 *   get:
 *     summary: Listen for email verification status
 *     tags: [SSE]
 *     x-status: "new"
 *     x-category: system
 *     description: >
 *       Opens a **Server-Sent Events (SSE)** stream for the given email address.
 *       The connection stays alive until one of the following happens:
 *
 *       - The email is verified → server sends `{ "status": "verified" }`
 *       - 15 minutes pass with no verification → server sends `{ "status": "timeout" }` and closes
 *       - The client disconnects → server cleans up automatically
 *
 *
 *       **How to consume in Flutter / Dart:**
 *       ```dart
 *       final uri = Uri.parse('https://test-fixer.onrender.com/api/V2/sse/verify?email=user@example.com');
 *       final client = http.Client();
 *       final request = http.Request('GET', uri);
 *       final response = await client.send(request);
 *       response.stream.transform(utf8.decoder).listen((data) {
 *         print(data); // { "status": "verified" } or { "status": "timeout" }
 *       });
 *       ```
 *
 *
 *       **Keep-alive:** A `: ping` comment is sent every 25 seconds to prevent proxy timeouts.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: user@example.com
 *         description: The email address to watch for verification
 *     responses:
 *       200:
 *         description: SSE stream opened successfully — events will be pushed as they occur
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: text/event-stream
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: no-cache
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: Stream of SSE events
 *             examples:
 *               verified:
 *                 summary: Email was verified
 *                 value: "data: {\"status\": \"verified\"}\n\n"
 *               timeout:
 *                 summary: 15-minute timeout reached
 *                 value: "data: {\"status\": \"timeout\"}\n\n"
 *               heartbeat:
 *                 summary: Keep-alive ping (every 25 seconds)
 *                 value: ": ping\n\n"
 *       400:
 *         description: Missing required `email` query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "email query parameter is required"
 */
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
