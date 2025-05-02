const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let players = [];

io.on(`connection`, (socket) => {
  const playerName = `Player${players.length + 1}`;
  players.push(playerName);

  io.emit(`players`, players);

  let disconnectTimeout;

  socket.on("disconnect", () => {
    disconnectTimeout = setTimeout(() => {
      players = players.filter((p) => p !== playerName);
      io.emit("players", players);
    }, 15000);
  });

  socket.on("reconnect", () => {
    clearTimeout(disconnectTimeout);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running at http://localhost:${PORT}`);
});
