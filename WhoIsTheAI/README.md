
# 🤖 Who is the AI?

A multiplayer social deduction game where players try to identify who among them is secretly an AI. The AI is powered by OpenAI's GPT API and is designed to mimic real human responses, making the game both challenging and fun.

## 🎮 Gameplay Rules

1. Each game has 2–7 real players and one hidden AI.
2. All players answer the same question in each round.
3. After answers are shown, players vote to eliminate the AI.
4. The player with the most votes is removed.
5. The game continues until the AI is eliminated — or the AI wins by outlasting the humans.
6. No spamming or disrespectful language — fair play is expected.

> Rules are displayed in a clear, numbered list inside a scrollable container to ensure readability on all devices.

## 📱 Pages Overview

| Page         | Description                                           |
|--------------|-------------------------------------------------------|
| Welcome      | Entry screen with team info and navigation options   |
| Intro        | Scrollable game rules and policy                     |
| Settings     | Placeholder for future settings                      |
| Dashboard    | Game statistics from MongoDB (total games, win rates)|
| Loading      | Pre-game room showing who’s ready                    |
| Chatroom     | Core gameplay with question/answer and vote phases   |
| Ending       | Shows win/loss result with replay option             |

## 🧠 AI Design

- The AI uses GPT-4o to generate natural, sometimes misleading responses.
- Behaviors are intentionally varied in accuracy and tone.
- AI answers mimic lazy or vague human replies to make detection harder.

## 🧩 Tech Stack

| Layer      | Technology                      | Purpose                                       |
|------------|----------------------------------|-----------------------------------------------|
| Frontend   | React Native + Expo Router       | Mobile UI, navigation, and layout             |
| Backend    | Node.js + Express                | Socket server and API endpoints               |
| Real-time  | Socket.IO                        | Question, answer, vote, elimination events    |
| Database   | MongoDB                          | Store game stats (wins, duration, etc.)       |
| AI         | OpenAI GPT-4o API                | Generate AI responses in-game                 |
| Charts     | react-native-chart-kit           | Visualize statistics on dashboard             |
| Dev Tool   | ngrok                            | Expose backend locally during development     |

## 🎨 UI/UX Design Notes

- Consistent dark theme across pages  
- ScrollView for long content (rules, messages)  
- Concise typography and card layouts  
- Countdown timers for real-time pressure  
- Responsive styling for both Android and iOS

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/hrjlhy123/cs624-tp.git
   cd cs624-tp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   Create a `.env` file:
   ```bash
   OPENAI_API_KEY=your_openai_key_here
   ```

4. **Start backend server**
   ```bash
   node server.js
   ```

5. **Start frontend**
   ```bash
   npx expo start
   ```

## 👥 Team

Built by **Team 7** – CS624 Full-Stack Mobile App Development
