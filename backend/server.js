// import express from "express";
// import { createServer } from "http";
// import { WebSocketServer } from "ws";
// import isUtf8 from 'is-utf8';

// const app = express();
// const server = createServer(app);
// const wss = new WebSocketServer({ server });

// app.get("/api/test", (req, res) => {
//   res.json({ message: "Hello from backend" });
// });

// wss.on("connection", (ws) => {
//   console.log("Client connected");

//   ws.on("message", (message) => {
//     if (Buffer.isBuffer(message)) {
//       if (isUtf8(message)) {
//         // ✅ It's a UTF-8 string
//         const text = message.toString("utf-8");
//         console.log("Received text message:", text);

//         wss.clients.forEach((client) => {
//           if (client.readyState === ws.OPEN) {
//             client.send(text);
//           }
//         });
//       } else {
//         // ✅ It's binary (image, PDF, etc.)
//         console.log("Received binary message, size:", message.length);

//         wss.clients.forEach((client) => {
//           if (client.readyState === ws.OPEN) {
//             client.send(message); // send as-is
//           }
//         });
//       }
//     }
//   });

//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });


// server.listen(8080, () => {
//   console.log("Backend listening on http://localhost:8080");
// });


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import database from "./config/db.js";
import chatRouter from "./routes/ChatRoute.js";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./webSocket/ChatSocket.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRouter);

database();

// Create HTTP + WebSocket server
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Setup WebSocket handling
setupWebSocket(wss);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;
