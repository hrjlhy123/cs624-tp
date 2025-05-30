import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { getSocket } from "../../utils/socketRef";

export default function Chatroom() {
  const router = useRouter();
  const { players } = useLocalSearchParams();
  // const [playerList, setPlayerList] = useState<string[]>([]);
  const [question, setQuestion] = useState(``);
  const [chatList, setChatList] = useState<{ name: string; text: string }[]>(
    []
  );
  const [message, setMessage] = useState(``);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [phase, setPhase] = useState<`qa` | `vote`>(`qa`);
  // const [shuffledList, setShuffledList] = useState<string[]>([]);
  const [isEliminated, setIsEliminated] = useState(false);

  const handleChat = (data: { name: string; text: string }) => {
    setChatList((prev) => [...prev, data]);
  };

  const vote = (who: string, target: string) => {
    if (hasVoted || isEliminated) return;
    getSocket()?.emit(`vote`, { who: who, vote: target });
    setHasVoted(true);
  };

  const render = () => {
    switch (phase) {
      case `qa`:
        const socket = getSocket();
        if (!socket) return;

        return (
          <>
            {/* ❶ Question & live answers */}
            <Text>Question:</Text>
            <Text>{question}</Text>
            <Text>Answer:</Text>
            {chatList.map((m, i) => (
              <Text key={i}>
                {m.name}: {m.text}
              </Text>
            ))}
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={
                isEliminated ? "You are eliminated." : "Type your answer…"
              }
              editable={!isEliminated}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (!isEliminated) {
                  socket.emit("answer", message.trim());
                  setMessage(``);
                }
              }}
            />
          </>
        );
      case `vote`:
        const self = getSocket()!;
        // console.log("playerList:", playerList);
        return (
          <>
            <Text>Vote:</Text>
            {chatList
              // .filter((p) => p !== self.id)
              .map((player) => (
                <Pressable
                  key={player.name}
                  onPress={() => vote(self.id as string, player.name)}
                  disabled={hasVoted || isEliminated}
                >
                  <Text>{player.name}</Text>
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

    socket.emit("question");

    // @ts-ignore
    console.log("players:", JSON.parse(players));
    // setPlayerList(JSON.parse(players as string));
    setPhase("qa");

    socket.on("question", setQuestion);
    socket.on("answer", handleChat);
    socket.on("countdown", setCountdown);
    socket.on("countdown complete", (result) => {
      console.log(`result:`, result);
      if (result === "qa") {
        setChatList([]);
        socket.emit("question");
        setPhase("qa");
        setHasVoted(false);
      } else if (result === "vote") {
        socket.emit("vote");
        setPhase("vote");
      } else {
        setChatList([]);
        socket.emit("question");
        setPhase("qa");
        setHasVoted(false);
      }
    });
    socket.on("vote result", (result) => {
      console.log("Vote Result:", result);
      // Back to Q&A
      // setPhase("qa");
      // sendMessage("question", "What does an apple look like?");
      // countdown...
      // then vote result
    });
    socket.on("eliminated", () => {
      console.log("🔴 You have been eliminated.");
      setIsEliminated(true);
    });

    socket.on(`gg`, (result) => {
      router.push({
        pathname: `/lv3/ending`,
        params: { result }
      })
    })

    return () => {
      socket.off("question", setQuestion);
      socket.off("answer", handleChat);
      socket.off("countdown", setCountdown);
      socket.off("countdown complete");
      socket.off("vote result");
      socket.off("eliminated");
      socket.off(`gg`)
    };
  }, []);

  // useEffect(() => {
  //   if (phase === "vote" && playerList.length > 0) {
  //     setShuffledList([...playerList].sort(() => Math.random() - 0.5));
  //   }
  // }, [phase, playerList]);

  //   const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;ChatRoom&gt;</Text>
      {countdown !== null && (
        <Text style={{ fontSize: 30, color: "red" }}>{countdown}</Text>
      )}
      {render()}
    </View>
  );
}
