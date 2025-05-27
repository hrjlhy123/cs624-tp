import { GPT } from "./AI.js";

const readyMap = new Map();
const voteMap = new Map();
const answers = new Map();
let countdownTimer = null;
let isGeneratingQuestion = false;
const AI_name = `AI`;

const checkAllReady = () =>
  readyMap.size > 0 && Array.from(readyMap.values()).every((p) => p.ready);

const startCountdown = (io, seconds = 3) => {
  if (!countdownTimer) {
    io.emit("countdown", seconds);
    countdownTimer = setInterval(() => {
      seconds--;
      io.emit("countdown", seconds);
      if (seconds <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        io.emit("countdown complete");
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
    readyMap.set(socket.id, { ready: false });
    cancelCountdown(io);

      io.emit("players", [AI_name, ...Array.from(readyMap.keys())]);

    socket.on("ready", () => {
      const player = readyMap.get(socket.id);
      if (player) {
        player.ready = true;
        io.emit("players", [AI_name, ...Array.from(readyMap.keys())]);
        if (checkAllReady()) startCountdown(io);
      }
    });

    socket.on("question", async () => {
      console.log(`question`);
      const questionText = "What is the capital of France?";
      io.emit(`question`, questionText);
      startCountdown(io, 60);

      if (!isGeneratingQuestion) {
        isGeneratingQuestion = true;
        try {
          const gpt = await GPT(`gpt-4o`, null, questionText);

          const gptReply = gpt?.message?.content || "";

          const fullMessage = {
            name: AI_name,
            text: gptReply,
          };
          setTimeout(() => {
            io.emit(`answer`, fullMessage);
          }, Math.floor(Math.random() * 26) * 1000);
        } catch (err) {
          console.error("❌ GPT error:", err);
        }
      }
    });

    socket.on("answer", (message) => {
      answers.set(socket.id, message);
      io.emit("answer", {
        name: socket.id,
        text: message,
      });

      if (answers.size === readyMap.size) {
        console.log("✅ All players answered:");
        for (const [sid, msg] of answers.entries()) {
          console.log(`- ${sid}: ${msg}`);
        }
        answers.clear();
      }
    });

    socket.on("disconnect", () => {
      readyMap.delete(socket.id);
      answers.delete(socket.id);

      io.emit("players", [AI_name, ...Array.from(readyMap.keys())]);

      cancelCountdown(io);
      if (checkAllReady()) startCountdown(io);
    });

    socket.on("vote", (message) => {
      // temporary
      isGeneratingQuestion = false;

      const voterId = socket.id;
      const targetId = message.vote;

      console.log(socket.id, "vote for:", message.vote);

      voteMap.set(voterId, targetId);

      if (voteMap.size === readyMap.size) {
        const voteCounts = new Map();

        for (const vote of voteMap.values()) {
          voteCounts.set(vote, (voteCounts.get(vote) || 0) + 1);
        }

        let maxVotes = 0;
        let topVoted = [];

        for (const [playerId, count] of voteCounts.entries()) {
          if (count > maxVotes) {
            maxVotes = count;
            topVoted = [playerId];
          } else if (count === maxVotes) {
            topVoted.push(playerId);
          }
        }

        io.emit("vote result", {
          voteCounts: Object.fromEntries(voteCounts),
          topVoted,
        });

        voteMap.clear();
      }
    });
  });
}
