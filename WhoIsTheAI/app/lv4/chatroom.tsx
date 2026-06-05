import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { getGameSettings } from "../../utils/gameSettings";
import { getSocket } from "../../utils/socketRef";

type ChatMessage = {
  name: string;
  text: string;
};

export default function Chatroom() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const settings = getGameSettings();
  const compact = settings.compactMode || width < 420 || height < 720;
  const [question, setQuestion] = useState("Waiting for the next question...");
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const chatListRef = useRef<ChatMessage[]>([]);
  const [voteOptions, setVoteOptions] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [phase, setPhase] = useState<"qa" | "vote">("qa");
  const [isEliminated, setIsEliminated] = useState(false);
  const [statusText, setStatusText] = useState("");
  const hasAnswered = useRef(false);
  const hasVoted = useRef(false);
  const hasEliminated = useRef(false);

  const clearAnswers = () => {
    chatListRef.current = [];
    setChatList([]);
    setVoteOptions([]);
  };

  const handleChat = (data: ChatMessage) => {
    if (!data || typeof data.name !== "string") return;

    setChatList((prev) => {
      const next = [
        ...prev,
        {
          name: data.name,
          text: typeof data.text === "string" ? data.text : "",
        },
      ];
      chatListRef.current = next;
      return next;
    });
  };

  const submitAnswer = () => {
    const socket = getSocket();
    const answer = message.trim();
    if (!socket || hasEliminated.current || hasAnswered.current || !answer) {
      return;
    }

    socket.emit("answer", answer);
    setMessage("");
    hasAnswered.current = true;
  };

  const vote = (target: string) => {
    const socket = getSocket();
    if (!socket || hasVoted.current || hasEliminated.current) return;

    socket.emit("vote", { vote: target });
    hasVoted.current = true;
    setStatusText(`Voted for ${target}`);
  };

  const renderPhase = () => {
    if (phase === "qa") {
      return (
        <>
          <Text style={styles.label}>Question</Text>
          <Text style={[styles.question, compact && styles.questionCompact]}>
            {question}
          </Text>

          <Text style={styles.label}>Answers</Text>
          <ScrollView
            style={[styles.answerList, compact && styles.answerListCompact]}
          >
            {chatList.length ? (
              chatList.map((chat, index) => (
                <Text key={`${chat.name}-${index}`} style={styles.answer}>
                  {chat.name}: {chat.text || "(blank)"}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>Waiting for answers...</Text>
            )}
          </ScrollView>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={
              hasEliminated.current ? "You are eliminated." : "Type your answer"
            }
            placeholderTextColor="#aaa"
            style={styles.input}
            editable={!hasEliminated.current && !hasAnswered.current}
            autoFocus={settings.autoFocusAnswer && !hasEliminated.current}
            returnKeyType="done"
            onSubmitEditing={submitAnswer}
          />
          <Pressable
            style={[
              styles.answerButton,
              (!message.trim() || hasAnswered.current || hasEliminated.current) &&
                styles.buttonDisabled,
            ]}
            onPress={submitAnswer}
            disabled={
              !message.trim() || hasAnswered.current || hasEliminated.current
            }
          >
            <Text style={styles.answerButtonText}>
              {hasAnswered.current ? "Submitted" : "Submit"}
            </Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Text style={styles.label}>Vote</Text>
        <View style={styles.voteList}>
          {voteOptions.length ? (
            voteOptions.map((player) => (
              <Pressable
                key={player}
                onPress={() => vote(player)}
                disabled={hasVoted.current || hasEliminated.current}
                style={[
                  styles.voteButton,
                  (hasVoted.current || hasEliminated.current) &&
                    styles.buttonDisabled,
                ]}
              >
                <Text style={styles.voteButtonText}>{player}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyText}>No answers to vote on.</Text>
          )}
        </View>
      </>
    );
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      setStatusText("Game connection is missing. Return to loading first.");
      return;
    }

    const handleQuestion = (nextQuestion: string) => {
      if (typeof nextQuestion === "string" && nextQuestion.trim()) {
        setQuestion(nextQuestion);
      }
    };

    const handleCountdownComplete = (result: string | null) => {
      if (result === "end") {
        return;
      }

      if (result === "vote") {
        const options = Array.from(
          new Set(chatListRef.current.map((chat) => chat.name))
        );
        setVoteOptions(options);
        socket.emit("vote");
        setPhase("vote");
        setStatusText("");
        return;
      }

      clearAnswers();
      socket.emit("question");
      setPhase("qa");
      setStatusText("");
      hasAnswered.current = false;
      hasVoted.current = false;
    };

    const handleVoteResult = () => {
      setStatusText("Vote counted");
    };

    const handleEliminated = () => {
      hasEliminated.current = true;
      setIsEliminated(true);
      setStatusText("You were eliminated.");
    };

    const handleGameOver = (resultObj: { result?: string }) => {
      router.replace({
        pathname: "/lv3/ending",
        params: { result: resultObj?.result === "lose" ? "lose" : "win" },
      });
    };

    socket.emit("question");
    setPhase("qa");

    socket.on("question", handleQuestion);
    socket.on("answer", handleChat);
    socket.on("countdown", setCountdown);
    socket.on("countdown complete", handleCountdownComplete);
    socket.on("vote result", handleVoteResult);
    socket.on("eliminated", handleEliminated);
    socket.on("gg", handleGameOver);

    return () => {
      socket.off("question", handleQuestion);
      socket.off("answer", handleChat);
      socket.off("countdown", setCountdown);
      socket.off("countdown complete", handleCountdownComplete);
      socket.off("vote result", handleVoteResult);
      socket.off("eliminated", handleEliminated);
      socket.off("gg", handleGameOver);
    };
  }, [router]);

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.overlayWrapper,
            compact && styles.overlayWrapperCompact,
          ]}
        >
          <View style={[styles.overlay, compact && styles.overlayCompact]}>
            <Text style={[styles.title, compact && styles.titleCompact]}>
              Chat Room
            </Text>
            {settings.showCountdown && countdown !== null ? (
              <Text style={styles.countdown}>{countdown}</Text>
            ) : null}
            {isEliminated || statusText ? (
              <Text style={styles.statusText}>{statusText}</Text>
            ) : null}
            {renderPhase()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  keyboardView: {
    flex: 1,
  },
  overlayWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  overlayWrapperCompact: {
    padding: 12,
  },
  overlay: {
    width: "100%",
    maxWidth: 720,
    alignItems: "center",
  },
  overlayCompact: {
    maxWidth: 520,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 22,
  },
  countdown: {
    fontSize: 34,
    color: "#ff5c5c",
    fontWeight: "bold",
    marginBottom: 12,
  },
  statusText: {
    color: "#d6ecff",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#54d8ff",
    marginBottom: 6,
    marginTop: 10,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  questionCompact: {
    fontSize: 18,
    lineHeight: 25,
  },
  answerList: {
    maxHeight: 220,
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  answerListCompact: {
    maxHeight: 150,
  },
  answer: {
    fontSize: 15,
    color: "#eee",
    textAlign: "center",
    paddingVertical: 4,
  },
  emptyText: {
    color: "#d8d8d8",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 10,
  },
  input: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#1f1f1f",
    color: "#fff",
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#555",
    marginBottom: 10,
    alignSelf: "center",
  },
  answerButton: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  answerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  voteList: {
    width: "100%",
    maxWidth: 420,
    gap: 8,
  },
  voteButton: {
    backgroundColor: "#1e90ff",
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  voteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
