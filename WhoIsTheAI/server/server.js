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
const readyMap = new Map();
const answers = new Map();
let countdownTimer = null;

const checkAllReady = () => {
  return players.length > 0 && players.every((p) => p.ready);
};

const startCountdown = () => {
  if (!countdownTimer) {
    let secondsLeft = 10;
    io.emit(`countdown`, secondsLeft);

    countdownTimer = setInterval(() => {
      secondsLeft--;
      io.emit(`countdown`, secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        io.emit(`startGame`);
      }
    }, 1000);
  }
};

const cancelCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    io.emit(`countdown`, null);
  }
};

io.on(`connection`, (socket) => {
  const playerName = `Player${players.length + 1}`;
  const playerObj = {
    name: playerName,
    ready: false,
  };

  players.push(playerObj);
  readyMap.set(socket.id, playerObj);

  cancelCountdown();

  io.emit(
    `players`,
    players.map((p) => p.name)
  );

  socket.on(`ready`, () => {
    playerObj.ready = true;
    io.emit(
      `players`,
      players.map((p) => p.name)
    );
    if (checkAllReady()) startCountdown();
  });

  socket.on(`chat`, (message) => {
    answers.set(socket.id, message);
    console.log(`${playerObj.name} answered: ${message}`);

    if (answers.size == players.length) {
      console.log(`✅ All players answered:`);
      for (const [sid, msg] of answers.entries()) {
        const p = readyMap.get(sid);
        console.log(`- ${p?.name || sid}: ${msg}`);
      }
      answers.clear();
    }
  });

  socket.on("disconnect", () => {
    const player = readyMap.get(socket.id);
    if (!player?.ready) {
      players = players.filter((p) => p.name !== player.name);
    }
    readyMap.delete(socket.id);
    answers?answers.delete(socket.id):"";
    io.emit(
      "players",
      players.map((p) => p.name)
    );

    cancelCountdown();
    if (checkAllReady()) startCountdown();
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running at http://localhost:${PORT}`);
});
