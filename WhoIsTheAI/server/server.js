import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socketHandler.js";
import { getLatestGameStats } from "./dbOperation.js";

const app = express();
app.use(cors());

app.get("/dashboard", async (req, res) => {
  const stats = await getLatestGameStats();
  if (!stats) return res.status(500).json({ error: "No data" });
  res.json(stats);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setupSocket(io);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running at http://localhost:${PORT}`);
});
