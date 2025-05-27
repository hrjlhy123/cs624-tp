import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { getSocket } from "../../utils/socketRef";

export default function Chatroom() {
  const router = useRouter();
  const { players } = useLocalSearchParams();
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [message, setMessage] = useState(``);
  const [chatList, setChatList] = useState<{ name: string; text: string }[]>(
    []
  );
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [phase, setPhase] = useState<`qa` | `vote`>(`qa`);

  const sendMessage = (type: string = "answer", customMessage?: string) => {
    const msg = (customMessage ?? message).trim();
    if (!msg) return;

    console.log(`sendMessage:`, msg);

    getSocket()?.emit(type, msg);
    setMessage("");
    Keyboard.dismiss();
  };

  const vote = (who: string, target: string) => {
    if (hasVoted) return;
    getSocket()?.emit(`vote`, { who: who, vote: target });
    setHasVoted(true);
  };

  const render = () => {
    switch (phase) {
      case `qa`:
        return (
          <>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your answer…"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => sendMessage("answer")}
            />
          </>
        );
      case `vote`:
        const self = getSocket()!;
        console.log('playerList:', playerList)
        return (
          <>
            <Text>Vote:</Text>
            {playerList
              .sort(() => Math.random() - 0.5)
              .filter((p) => p !== self.id)
              .map((player) => (
                <Pressable
                  key={player}
                  onPress={() => vote(self.id as string, player)}
                  disabled={hasVoted}
                >
                  <Text>{player}</Text>
                </Pressable>
              ))}
          </>
        );
      default:
        break;
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleChat = (data: { name: string; text: string }) => {
      setChatList((prev) => [...prev, data]);
    };
    // @ts-ignore
    console.log("players:", JSON.parse(players))
    setPlayerList(JSON.parse(players as string));
    setPhase("qa");

    socket.on("answer", handleChat);
    socket.on("countdown", setCountdown);
    socket.on("countdown complete", () => setPhase("vote"));
    socket.on("vote result", (result) => {
      console.log("Vote Result:", result)
    })

    sendMessage("question", "What is the capital of France?");

    return () => {
      socket.off("answer", handleChat);
      socket.off("countdown", setCountdown);
      socket.off("countdown complete");
      socket.off("vote result");
    };
  }, []);

  //   const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;ChatRoom&gt;</Text>
      {/* ❶ Question & live answers */}
      <Text>Question:</Text>
      <Text>What is the capital of France?</Text>

      {chatList.map((m, i) => (
        <Text key={i}>
          {m.name}: {m.text}
        </Text>
      ))}

      <Text>Answer:</Text>
      {countdown !== null && (
        <Text style={{ fontSize: 30, color: "red" }}>{countdown}</Text>
      )}
      {render()}
    </View>
  );
}
