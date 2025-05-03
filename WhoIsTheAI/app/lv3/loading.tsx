import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";

export default function Loading() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(`https://e7e54f1f7904.ngrok.app`);

    socketRef.current.on(`players`, (data) => {
      setPlayers(data);
    });

    socketRef.current.on(`countdown`, (secondsLeft) => {
      if (secondsLeft == null) {
        console.log(`⛔ Countdown stopped`)
      } else {
        console.log(`⏳ Countdown: ${secondsLeft}`)
      }
    })

    socketRef.current.on(`startGame`, () => {
      router.push(`/lv4/chatroom`)
    })

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;Loading&gt;</Text>
      <Text>Players:</Text>
      {players.map((p, i) => (
        <Text key={i}>{p}</Text>
      ))}
      <Pressable
        onPress={() => {
          socketRef.current?.emit(`ready`);
          router.push("/");
        }}
      >
        <Text>Ready?</Text>
      </Pressable>
    </View>
  );
}
