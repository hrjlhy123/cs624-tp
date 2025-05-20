import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";
import { getSocket, initSocket } from "../../utils/socketRef";

export default function Loading() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  // const socketRef = useRef<Socket | null>(null);

  // useEffect(() => {
  //   socketRef.current = io(`https://wita-api.ngrok.io`);

  //   socketRef.current.on(`players`, (data) => {
  //     setPlayers(data);
  //   });

  //   socketRef.current.on(`countdown`, (secondsLeft) => {
  //     setCountdown(secondsLeft);
  //     if (secondsLeft == null) {
  //       console.log(`⛔ Countdown stopped`);
  //     } else {
  //       console.log(`⏳ Countdown: ${secondsLeft}`);
  //     }
  //   });

  //   socketRef.current.on(`startGame`, () => {
  //     router.push(`/lv4/chatroom`);
  //   });

  //   return () => {
  //     socketRef.current?.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    const socket = initSocket();

    socket.on("players", setPlayers);
    socket.on("countdown", setCountdown);
    socket.on("startGame", () => router.push("/lv4/chatroom"));

    return () => {
      socket.off("players");
      socket.off("countdown");
      socket.off("startGame");
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;Loading&gt;</Text>
      <Text>Players:</Text>
      {players.map((p, i) => (
        <Text key={i}>{p}</Text>
      ))}
      {/* <Pressable
        onPress={() => {
          socketRef.current?.emit(`ready`);
        }}
      >
        <Text>Ready?</Text>
      </Pressable> */}
      <Pressable onPress={() => getSocket()?.emit("ready")}>
        <Text>Ready?</Text>
      </Pressable>
      {countdown !== null && (
        <Text style={{ fontSize: 30, color: "red" }}>{countdown}</Text>
      )}
    </View>
  );
}
