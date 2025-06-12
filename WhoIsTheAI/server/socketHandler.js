import fs from "fs";
import path from "path";
import { GPT } from "./AI.js";
import { saveGameStats } from "./dbOperation.js";

const statsFilePath = path.resolve("./stats.json");

let stats = {
  totalGames: 0,
  totalGameTime: 0,
  humanWins: 0,
  aiWins: 0,
};

let gameStartTime = null;

if (fs.existsSync(statsFilePath)) {
  try {
    const data = fs.readFileSync(statsFilePath);
    stats = JSON.parse(data);
  } catch (e) {
    console.error("❌ Failed to read stats file", e);
  }
}

function saveStats() {
  fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));
}

const readyMap = new Map();
const voteMap = new Map();
const answers = new Map();
const nameToSocketId = new Map();
const socketIdToName = new Map();
let countdownTimer = null;
let isGeneratingQuestion = false;
let answerCount = 0;
const AI_ID = `AI`;

const questions = [
  "What is the capital of France?",
  "What color is the sky?",
  "How many continents are there?",
  "Name a mammal that can fly.",
  "What is the boiling point of water in Celsius?",
  "Who wrote 'Hamlet'?",
  "What is the largest ocean?",
  "Which planet is known as the Red Planet?",
  "What is 7 multiplied by 8?",
  "What is the chemical symbol for gold?",
];

const anonymousNamesPool = [
  "Mysterious Fox",
  "Shadow Walker",
  "Silent Whisper",
  "Blue Phantom",
  "Crimson Owl",
  "Nameless One",
  "Coded Ghost",
  "Sneaky Cat",
  "Blurred Face",
  "Hidden Star",
  "Unknown Hero",
  "Ghost Protocol",
  "Invisible Ink",
  "Secret Agent",
  "Blackout",
  "Echo Voice",
  "Anonymous",
  "Player X",
  "Masked Raven",
  "Unseen Blade",
  "???",
  "Nobody",
];

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
const generateAnonymousNames = (count) =>
  shuffle([...anonymousNamesPool]).slice(0, count);

const emitPlayerList = (io) => {
  const list = Array.from(socketIdToName.entries()).map(([id, name]) => ({
    name,
    ready: readyMap.get(id)?.ready || false,
  }));
  if (!list.some((p) => p.name === AI_ID)) {
    list.unshift({ name: AI_ID, ready: true });
  }
  io.emit("players", list);
};

const usedQuestions = new Set();
const eliminatedSet = new Set();

const getNormalRandom = (mean = 15, stdDev = 5, min = 0, max = 30) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  const sample = Math.round(num * stdDev + mean);
  return Math.max(min, Math.min(max, sample));
};

const getNextQuestion = () => {
  const available = questions.filter((q) => !usedQuestions.has(q));
  if (available.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * available.length);
  const next = available[randomIndex];
  usedQuestions.add(next);
  return next;
};

const checkAllReady = () =>
  readyMap.size > 0 && Array.from(readyMap.values()).every((p) => p.ready);

const startCountdown = (io, seconds = 3, phase = NaN) => {
  if (!countdownTimer) {
    io.emit("countdown", seconds);
    countdownTimer = setInterval(() => {
      seconds--;
      io.emit("countdown", seconds);
      if (seconds <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        io.emit("countdown complete", phase);
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

const checkAllAnswered = (io) => {
  const activePlayersCount = Array.from(readyMap.keys()).filter(
    (id) => !eliminatedSet.has(id)
  ).length;
  console.log(
    `answers.size:`,
    answers.size,
    `activePlayersCount:`,
    activePlayersCount
  );
  if (answers.size === activePlayersCount) {
    console.log("✅ All players answered:");
    for (const [sid, msg] of answers.entries()) {
      console.log(`- ${sid}: ${msg}`);
    }
    cancelCountdown(io);
    startCountdown(io, 3, "vote");
    answers.clear();
  }
};

export function setupSocket(io) {
  io.on("connection", (socket) => {
    readyMap.set(socket.id, { ready: false });
    cancelCountdown(io);

    // let playerCount = readyMap.size;
    // let obfuscatedNames = [AI_ID, ...generateAnonymousNames(playerCount)];
    // io.emit("players", obfuscatedNames);
    const availableNames = anonymousNamesPool.filter(
      (name) => ![...socketIdToName.values()].includes(name)
    );
    const assignedName =
      availableNames[Math.floor(Math.random() * availableNames.length)];
    socketIdToName.set(socket.id, assignedName);

    emitPlayerList(io);

    socket.on("ready", () => {
      const player = readyMap.get(socket.id);
      if (player) {
        player.ready = true;
        // const currentCount = readyMap.size;
        // const obfuscatedNames = [
        //   AI_ID,
        //   ...generateAnonymousNames(currentCount),
        // ];
        // io.emit("players", obfuscatedNames);

        emitPlayerList(io);

        if (!readyMap.has(AI_ID)) {
          readyMap.set(AI_ID, { ready: true });
        }
        const humanPlayersReady = Array.from(readyMap.entries()).filter(
          ([id, p]) => id !== AI_ID && p.ready
        );

        if (
          humanPlayersReady.length >= 2 &&
          humanPlayersReady.length <= 7 &&
          checkAllReady()
        ) {
          gameStartTime = Date.now();
          startCountdown(io);
        }
      }
    });

    socket.on("playerlist", () => {
      emitPlayerList(io);
    });

    socket.on("question", async () => {
      answerCount = 0;
      // console.log("isGeneratingQuestion:", isGeneratingQuestion);
      let questionText;

      if (!isGeneratingQuestion) {
        isGeneratingQuestion = true;

        questionText = getNextQuestion();
        console.log(`🟡 question:`, questionText);

        try {
          const questionPrompt = `You're a player in a social deception game. Other players are humans who usually give lazy, short, or careless answers — sometimes right, sometimes wrong.

          Answer like a real player would:

          - Quick answer
          - Less respect, emotional sometimes
          - Less punctuation or filler or emoji
          - Better one word since humans are lazy
          ${
            Math.random() < 0.3
              ? `- IMPORTANT: Sometimes (not always), answer wrong, vague, or nonsense (e.g.'asdasd', 'qwerty', ...)`
              : ``
          }

          Question: ${questionText}
          Answer:`;

          const gpt = await GPT(`gpt-4o`, null, questionPrompt);

          const gptReply = gpt?.message?.content || "";

          const delay = getNormalRandom(15, 5, 0, 30) * 1000;

          setTimeout(() => {
            answerCount++;
            const playerName = `player${answerCount}`;
            io.emit(`answer`, {
              name: playerName,
              text: gptReply,
            });
            answers.set(AI_ID, gptReply);
            nameToSocketId.set(playerName, AI_ID);
            setTimeout(() => {
              checkAllAnswered(io);
            }, Math.random() * 200);
          }, delay);
        } catch (err) {
          console.error("❌ GPT error:", err);
        }
      }

      io.emit(`question`, questionText);
      startCountdown(io, 60, "vote");
    });

    socket.on("answer", (message) => {
      answerCount++;
      const playerName = `player${answerCount}`;
      answers.set(socket.id, message);
      nameToSocketId.set(playerName, socket.id);
      io.emit("answer", {
        name: playerName,
        text: message,
      });

      checkAllAnswered(io);
    });

    socket.on("disconnect", () => {
      readyMap.delete(socket.id);
      answers.delete(socket.id);
      socketIdToName.delete(socket.id);

      // let obfuscatedNames = [AI_ID, ...generateAnonymousNames(playerCount)];
      // io.emit("players", obfuscatedNames);

      emitPlayerList(io);
      cancelCountdown(io);
      if (checkAllReady()) startCountdown(io);
      isGeneratingQuestion = false;
    });

    socket.on("vote", (message) => {
      if (!message) {
        startCountdown(io, 60);
      } else {
        isGeneratingQuestion = false;

        const voterId = socket.id;
        const targetName = message.vote;
        const targetId = nameToSocketId.get(targetName);

        console.log(voterId, "vote for:", targetName);

        voteMap.set(voterId, targetId);

        console.log(`voteMap:`, voteMap, `readyMap:`, readyMap);

        const alivePlayersBeforeElimination = Array.from(
          readyMap.keys().filter((id) => !eliminatedSet.has(id))
        );

        if (voteMap.size === alivePlayersBeforeElimination.length - 1) {
          // -1 for AI
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

          if (topVoted.length === 1) {
            const eliminatedId = topVoted[0];
            eliminatedSet.add(eliminatedId);
            const eliminatedSocket = io.sockets.sockets.get(eliminatedId);
            eliminatedSocket?.emit("eliminated");
          } else {
            for (const eliminatedId of topVoted) {
              eliminatedSet.add(eliminatedId);
              const eliminatedSocket = io.sockets.sockets.get(eliminatedId);
              eliminatedSocket?.emit("eliminated");
            }
          }

          const alivePlayersAfterElimination = Array.from(
            readyMap.keys().filter((id) => !eliminatedSet.has(id))
          );

          const AIAlive = !eliminatedSet.has(AI_ID);
          console.log("eliminatedSet:", eliminatedSet, "AI_ID:", AI_ID);

          if (!AIAlive && alivePlayersAfterElimination.length > 1) {
            console.log(`player win!`);
            cancelCountdown(io);
            startCountdown(io, 10);
            setTimeout(() => {
              io.emit(`gg`, { result: `win` });
              for (const [id, player] of readyMap.entries()) {
                if (id !== AI_ID) {
                  player.ready = false;
                }
              }
              const gameDuration = Math.round(
                (Date.now() - gameStartTime) / 1000
              );
              stats.totalGames++;
              stats.totalGameTime += gameDuration;
              stats.humanWins++;
              saveStats();
              const aiWinRate =
                stats.totalGames > 0
                  ? (stats.aiWins / stats.totalGames).toFixed(2)
                  : "0.00";
              console.log("📊 Stats:", {
                totalGames: stats.totalGames,
                totalGameTime: stats.totalGameTime + "s",
                humanWins: stats.humanWins,
                aiWins: stats.aiWins,
                aiWinRate: `${aiWinRate * 100}%`,
              });

              saveGameStats({
                totalGames: stats.totalGames,
                totalGameTime: stats.totalGameTime,
                humanWins: stats.humanWins,
                aiWins: stats.aiWins,
              });
            }, 10000);
          } else if (alivePlayersAfterElimination.length <= 1) {
            console.log(`player lose!`);
            // if (alivePlayers.length === 1) {
            //   console.log(`Only one player left, skipping vote in next round`);
            // }
            cancelCountdown(io);
            startCountdown(io, 10);
            setTimeout(() => {
              io.emit(`gg`, { result: `lose` });
              for (const [id, player] of readyMap.entries()) {
                if (id !== AI_ID) {
                  player.ready = false;
                }
              }
              const gameDuration = Math.round(
                (Date.now() - gameStartTime) / 1000
              );
              stats.totalGames++;
              stats.totalGameTime += gameDuration;
              stats.aiWins++;
              saveStats();
              const aiWinRate =
                stats.totalGames > 0
                  ? (stats.aiWins / stats.totalGames).toFixed(2)
                  : "0.00";
              console.log("📊 Stats:", {
                totalGames: stats.totalGames,
                totalGameTime: stats.totalGameTime + "s",
                humanWins: stats.humanWins,
                aiWins: stats.aiWins,
                aiWinRate: `${aiWinRate * 100}%`,
              });

              saveGameStats({
                totalGames: stats.totalGames,
                totalGameTime: stats.totalGameTime,
                humanWins: stats.humanWins,
                aiWins: stats.aiWins,
              });
            }, 10000);
          } else {
            console.log(
              `Game continue: AIAlive:`,
              AIAlive,
              `aliverPlayers.length:`,
              alivePlayersAfterElimination.length
            );
            cancelCountdown(io);
            startCountdown(io, 10, "qa");
          }
          answers.clear();
          voteMap.clear();
        }
      }
    });
  });
}
