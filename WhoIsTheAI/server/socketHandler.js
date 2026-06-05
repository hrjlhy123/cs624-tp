import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GPT } from "./AI.js";
import { saveGameStats } from "./dbOperation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const statsFilePath = path.resolve(__dirname, "stats.json");
const AI_ID = "AI";

let stats = {
  totalGames: 0,
  totalGameTime: 0,
  humanWins: 0,
  aiWins: 0,
};

if (fs.existsSync(statsFilePath)) {
  try {
    const data = fs.readFileSync(statsFilePath, "utf8");
    stats = JSON.parse(data);
  } catch (error) {
    console.error("Failed to read stats file", error);
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
const usedQuestions = new Set();
const eliminatedSet = new Set();

let countdownTimer = null;
let isGeneratingQuestion = false;
let answerCount = 0;
let currentQuestion = null;
let gameStartTime = null;
let gameActive = false;
let endingInProgress = false;
let roundPhase = "lobby";

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

const emitPlayerList = (io) => {
  const list = Array.from(socketIdToName.entries()).map(([id, name]) => ({
    name,
    ready: readyMap.get(id)?.ready || false,
  }));

  if (!list.some((player) => player.name === AI_ID)) {
    list.unshift({ name: AI_ID, ready: true });
  }

  io.emit("players", list);
};

const getNormalRandom = (mean = 15, stdDev = 5, min = 0, max = 30) => {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const sample = Math.round(num * stdDev + mean);
  return Math.max(min, Math.min(max, sample));
};

const getNextQuestion = () => {
  const available = questions.filter((question) => !usedQuestions.has(question));
  if (available.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * available.length);
  const next = available[randomIndex];
  usedQuestions.add(next);
  return next;
};

const resetRoundState = () => {
  answers.clear();
  voteMap.clear();
  nameToSocketId.clear();
  answerCount = 0;
  currentQuestion = null;
  isGeneratingQuestion = false;
  roundPhase = "between";
};

const resetGameState = () => {
  resetRoundState();
  eliminatedSet.clear();
  usedQuestions.clear();
  endingInProgress = false;
  roundPhase = "lobby";
};

const getAliveReadyIds = () =>
  Array.from(readyMap.entries())
    .filter(([, player]) => player.ready)
    .map(([id]) => id)
    .filter((id) => !eliminatedSet.has(id));

const getAliveHumanIds = () =>
  getAliveReadyIds().filter((id) => id !== AI_ID);

const checkAllReady = () =>
  readyMap.size > 0 && Array.from(readyMap.values()).every((player) => player.ready);

const startCountdown = (io, seconds = 3, phase = null) => {
  if (countdownTimer) return;

  io.emit("countdown", seconds);
  countdownTimer = setInterval(() => {
    seconds -= 1;
    io.emit("countdown", seconds);

    if (seconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      io.emit("countdown complete", phase);
    }
  }, 1000);
};

const cancelCountdown = (io) => {
  if (!countdownTimer) return;

  clearInterval(countdownTimer);
  countdownTimer = null;
  io.emit("countdown", null);
};

const setHumanPlayersNotReady = () => {
  for (const [id, player] of readyMap.entries()) {
    if (id !== AI_ID) {
      player.ready = false;
    }
  }
};

const persistResult = (winner) => {
  const gameDuration = gameStartTime
    ? Math.max(0, Math.round((Date.now() - gameStartTime) / 1000))
    : 0;

  stats.totalGames += 1;
  stats.totalGameTime += gameDuration;

  if (winner === "win") {
    stats.humanWins += 1;
  } else {
    stats.aiWins += 1;
  }

  saveStats();
  saveGameStats({
    totalGames: stats.totalGames,
    totalGameTime: stats.totalGameTime,
    humanWins: stats.humanWins,
    aiWins: stats.aiWins,
  });
};

const finishGame = (io, result) => {
  if (endingInProgress) return;

  endingInProgress = true;
  roundPhase = "ending";
  cancelCountdown(io);
  startCountdown(io, 10, "end");

  setTimeout(() => {
    io.emit("gg", { result });
    persistResult(result);
    setHumanPlayersNotReady();
    gameActive = false;
    gameStartTime = null;
    resetGameState();
    emitPlayerList(io);
  }, 10000);
};

const checkAllAnswered = (io) => {
  const activePlayersCount = getAliveReadyIds().length;

  if (activePlayersCount > 0 && answers.size >= activePlayersCount) {
    cancelCountdown(io);
    startCountdown(io, 3, "vote");
    answers.clear();
  }
};

const buildQuestionPrompt = (questionText) => `You're a player in a social deception game. Other players are humans who usually give lazy, short, or careless answers - sometimes right, sometimes wrong.

Answer like a real player would:
- Quick answer
- Less respect, emotional sometimes
- Less punctuation or filler
- Better one word since humans are lazy
${Math.random() < 0.3 ? "- Sometimes answer wrong, vague, or nonsense" : ""}

Question: ${questionText}
Answer:`;

const emitAiAnswer = (io, questionText, reply) => {
  const delay = getNormalRandom(15, 5, 0, 30) * 1000;

  setTimeout(() => {
    if (
      currentQuestion !== questionText ||
      answers.has(AI_ID) ||
      eliminatedSet.has(AI_ID)
    ) {
      return;
    }

    answerCount += 1;
    const playerName = `player${answerCount}`;
    answers.set(AI_ID, reply);
    nameToSocketId.set(playerName, AI_ID);
    io.emit("answer", {
      name: playerName,
      text: reply,
    });
    checkAllAnswered(io);
  }, delay);
};

export function setupSocket(io) {
  io.on("connection", (socket) => {
    readyMap.set(socket.id, { ready: false });

    if (!gameActive) {
      cancelCountdown(io);
    }

    const availableNames = anonymousNamesPool.filter(
      (name) => ![...socketIdToName.values()].includes(name)
    );
    const assignedName =
      availableNames[Math.floor(Math.random() * availableNames.length)] ||
      `Player ${socket.id.slice(0, 4)}`;
    socketIdToName.set(socket.id, assignedName);

    emitPlayerList(io);

    socket.on("ready", () => {
      const player = readyMap.get(socket.id);
      if (!player || gameActive) return;

      player.ready = true;
      emitPlayerList(io);

      if (!readyMap.has(AI_ID)) {
        readyMap.set(AI_ID, { ready: true });
      }

      const humanPlayersReady = Array.from(readyMap.entries()).filter(
        ([id, readyPlayer]) => id !== AI_ID && readyPlayer.ready
      );

      if (
        humanPlayersReady.length >= 2 &&
        humanPlayersReady.length <= 7 &&
        checkAllReady()
      ) {
        resetGameState();
        gameActive = true;
        roundPhase = "starting";
        gameStartTime = Date.now();
        startCountdown(io);
      }
    });

    socket.on("playerlist", () => {
      emitPlayerList(io);
    });

    socket.on("question", async () => {
      if (!gameActive) return;

      if (roundPhase === "vote" || roundPhase === "between") {
        resetRoundState();
      }

      if (!currentQuestion) {
        resetRoundState();
        currentQuestion = getNextQuestion();

        if (!currentQuestion) {
          usedQuestions.clear();
          currentQuestion = getNextQuestion();
        }
      }

      if (!currentQuestion) {
        finishGame(io, "lose");
        return;
      }

      const questionText = currentQuestion;
      roundPhase = "qa";
      io.emit("question", questionText);
      startCountdown(io, 60, "vote");

      if (isGeneratingQuestion) return;

      isGeneratingQuestion = true;

      try {
        const gpt = await GPT("gpt-4o", null, buildQuestionPrompt(questionText));
        const gptReply = gpt?.message?.content || "not sure";
        emitAiAnswer(io, questionText, gptReply);
      } catch (error) {
        console.error("GPT error:", error);
        emitAiAnswer(io, questionText, "not sure");
      }
    });

    socket.on("answer", (message) => {
      const player = readyMap.get(socket.id);
      if (!player?.ready || eliminatedSet.has(socket.id) || answers.has(socket.id)) {
        return;
      }

      answerCount += 1;
      const playerName = `player${answerCount}`;
      const text = typeof message === "string" ? message : "";
      answers.set(socket.id, text);
      nameToSocketId.set(playerName, socket.id);
      io.emit("answer", {
        name: playerName,
        text,
      });

      checkAllAnswered(io);
    });

    socket.on("disconnect", () => {
      readyMap.delete(socket.id);
      answers.delete(socket.id);
      voteMap.delete(socket.id);
      socketIdToName.delete(socket.id);

      emitPlayerList(io);

      if (!gameActive) {
        cancelCountdown(io);
        return;
      }

      if (getAliveHumanIds().length === 0) {
        gameActive = false;
        gameStartTime = null;
        cancelCountdown(io);
        resetGameState();
        return;
      }

      checkAllAnswered(io);
    });

    socket.on("vote", (message) => {
      if (!gameActive) return;

      if (!message) {
        roundPhase = "vote";
        startCountdown(io, 60, "qa");
        return;
      }

      const voterId = socket.id;
      const targetName = message.vote;
      const targetId = nameToSocketId.get(targetName);

      if (
        !targetId ||
        eliminatedSet.has(voterId) ||
        eliminatedSet.has(targetId) ||
        !readyMap.get(voterId)?.ready
      ) {
        return;
      }

      voteMap.set(voterId, targetId);

      const aliveVoters = getAliveHumanIds();
      if (voteMap.size < aliveVoters.length) return;

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

      for (const eliminatedId of topVoted) {
        eliminatedSet.add(eliminatedId);
        const eliminatedSocket = io.sockets.sockets.get(eliminatedId);
        eliminatedSocket?.emit("eliminated");
      }

      const aiAlive = !eliminatedSet.has(AI_ID);
      const aliveHumanCount = getAliveHumanIds().length;

      if (!aiAlive) {
        finishGame(io, "win");
        return;
      }

      if (aliveHumanCount <= 1) {
        finishGame(io, "lose");
        return;
      }

      cancelCountdown(io);
      resetRoundState();
      startCountdown(io, 10, "qa");
    });
  });
}
