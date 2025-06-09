import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getSocket } from "../../utils/socketRef";

export default function Chatroom() {
  const router = useRouter();
  const { players } = useLocalSearchParams();
  const [question, setQuestion] = useState(``);
  const [chatList, setChatList] = useState<{ name: string; text: string }[]>([]);
  const [message, setMessage] = useState(``);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [phase, setPhase] = useState<`qa` | `vote`>(`qa`);
  const hasAnswered = useRef(false);
  const hasVoted = useRef(false);
  const hasEliminated = useRef(false);

  const handleChat = (data: { name: string; text: string }) => {
    setChatList((prev) => [...prev, data]);
  };

  const vote = (who: string, target: string) => {
    if (hasVoted.current || hasEliminated.current) return;
    getSocket()?.emit(`vote`, { who, vote: target });
    hasVoted.current = true;
  };

  const render = () => {
    switch (phase) {
      case `qa`:
        const socket = getSocket();
        if (!socket) return null;

        return (
          <>
            <Text style={styles.label}>Question:</Text>
            <Text style={styles.question}>{question}</Text>

            <Text style={styles.label}>Answers:</Text>
            <ScrollView style={styles.answerList}>
              {chatList.map((m, i) => (
                <Text key={i} style={styles.answer}>
                  {m.name}: {m.text}
                </Text>
              ))}
            </ScrollView>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={
                hasEliminated.current ? "You are eliminated." : "Type your answer…"
              }
              placeholderTextColor="#aaa"
              style={styles.input}
              editable={!hasEliminated.current}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (!hasEliminated.current && !hasAnswered.current && message.trim()) {
                  socket.emit("answer", message.trim());
                  setMessage(``);
                  hasAnswered.current = true;
                }
              }}
            />
          </>
        );

      case `vote`:
        const self = getSocket();
        if (!self) return null;

        return (
          <>
            <Text style={styles.label}>Vote:</Text>
            {chatList.map((player) => (
              <Pressable
                key={player.name}
                onPress={() => vote(self.id as string, player.name)}
                disabled={hasVoted.current || hasEliminated.current}
                style={styles.voteButton}
              >
                <Text style={styles.voteButtonText}>{player.name}</Text>
              </Pressable>
            ))}
          </>
        );
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("question");
    setPhase("qa");

    socket.on("question", setQuestion);
    socket.on("answer", handleChat);
    socket.on("countdown", setCountdown);
    socket.on("countdown complete", (result) => {
      if (result === "qa") {
        if (!hasAnswered.current && !hasEliminated.current) {
          socket.emit("answer", "");
        }
        setChatList([]);
        socket.emit("question");
        setPhase("qa");
        hasAnswered.current = false;
        hasVoted.current = false;
      } else if (result === "vote") {
        socket.emit("vote");
        setPhase("vote");
      } else {
        setChatList([]);
        socket.emit("question");
        setPhase("qa");
        hasVoted.current = false;
      }
    });

    socket.on("vote result", () => {});
    socket.on("eliminated", () => {
      hasEliminated.current = true;
    });

    socket.on(`gg`, (resultObj) => {
      router.push({
        pathname: `/lv3/ending`,
        params: { result: resultObj.result },
      });
    });

    return () => {
      socket.off("question", setQuestion);
      socket.off("answer", handleChat);
      socket.off("countdown", setCountdown);
      socket.off("countdown complete");
      socket.off("vote result");
      socket.off("eliminated");
      socket.off(`gg`);
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>💬 ChatRoom</Text>
        {countdown !== null && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}
        {render()}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  countdown: {
    fontSize: 36,
    color: "red",
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00d1ff",
    marginBottom: 6,
    marginTop: 10,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  answerList: {
    maxHeight: 160,
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  answer: {
    fontSize: 15,
    color: "#eee",
    textAlign: "center",
    paddingVertical: 3,
  },
  input: {
    width: "80%",
    maxWidth: 500,
    backgroundColor: "#1f1f1f",
    color: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  voteButton: {
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 6,
  },
  voteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
