import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getSocket, initSocket } from "../../utils/socketRef";

export default function Loading() {
  const router = useRouter();
  const playersRef = useRef<string[]>([]);
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const socket = initSocket();
    socket.emit("playerlist");

    socket.on("players", (playerList) => {
      setPlayers(playerList.slice(1));
      playersRef.current = playerList;
    });
    socket.on("countdown", setCountdown);
    socket.on("countdown complete", () =>
      router.push({
        pathname: "/lv4/chatroom",
        params: { players: JSON.stringify(playersRef.current) }
      })
    );

    return () => {
      socket.off("players");
      socket.off("countdown");
      socket.off("countdown complete");
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;Loading&gt;</Text>
      <Text>Players:</Text>
      {players.map((p, i) => (
        <Text key={i}>{p}</Text>
      ))}
      <Pressable onPress={() => getSocket()?.emit("ready")}>
        <Text>Ready?</Text>
      </Pressable>
      {countdown !== null && (
        <Text style={{ fontSize: 30, color: "red" }}>{countdown}</Text>
      )}
    </View>
  );
}
