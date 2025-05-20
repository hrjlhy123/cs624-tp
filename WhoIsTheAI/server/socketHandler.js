import { GPT } from "./AI.js";

let players = [];
const readyMap = new Map();
const answers = new Map();
let countdownTimer = null;

const checkAllReady = () => players.length > 0 && players.every((p) => p.ready);

const startCountdown = (io) => {
  if (!countdownTimer) {
    let secondsLeft = 3;
    io.emit("countdown", secondsLeft);
    countdownTimer = setInterval(() => {
      secondsLeft--;
      io.emit("countdown", secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        io.emit("startGame");
      }
    }, 1000);
  }
};

const cancelCountdown = (io) => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    io.emit("countdown", null);
  }
};

export function setupSocket(io) {
  io.on("connection", (socket) => {
    const playerName = `Player${players.length + 1}`;
    const playerObj = { name: playerName, ready: false };

    players.push(playerObj);
    readyMap.set(socket.id, playerObj);
    cancelCountdown(io);

    io.emit("players", players.map((p) => p.name));

    socket.on("ready", () => {
      playerObj.ready = true;
      io.emit("players", players.map((p) => p.name));
      if (checkAllReady()) startCountdown(io);
    });

    socket.on("question", async (message) => {
      console.log(`question`)

      const gpt = await GPT(`gpt-4o`, null, message)

      const gptReply = gpt?.message?.content || ''

      const fullMessage = {
        name: `AI`,
        text: gptReply,
      }

      io.emit(`answer`, fullMessage)
    })

    socket.on("answer", (message) => {
      const player = readyMap.get(socket.id);
      console.log(`socket.id:`, socket.id, `\nplayer:`, player, `\nplayer name:`, player?.name, `\nmessage:`, message)
      const fullMessage = { name: player?.name || "Unknown", text: message };
      answers.set(socket.id, message);
      io.emit("answer", fullMessage);

      if (answers.size === players.length) {
        console.log("✅ All players answered:");
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
        players = players.filter((p) => p.name !== player?.name);
      }
      readyMap.delete(socket.id);
      answers.delete(socket.id);

      io.emit("players", players.map((p) => p.name));
      cancelCountdown(io);
      if (checkAllReady()) startCountdown(io);
    });
  });
}