import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { getSocket, initSocket } from "../../utils/socketRef";

type Player = {
  name: string;
  ready: boolean;
};

export default function Loading() {
  const router = useRouter();
  const playersRef = useRef<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
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
        params: { players: JSON.stringify(playersRef.current) },
      })
    );

    return () => {
      socket.off("players");
      socket.off("countdown");
      socket.off("countdown complete");
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlayWrapper}>
        <View style={styles.overlay}>
          <Text style={styles.title}>&lt; Loading &gt;</Text>
          <Text style={styles.subtitle}>Players:</Text>
          <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
            {players.map((p, i) => (
              <Text key={i} style={styles.player}>
                {p.name} {p.ready ? "✔" : "❌"}
              </Text>
            ))}
          </ScrollView>

          <Pressable style={styles.button} onPress={() => getSocket()?.emit("ready")}>
            <Text style={styles.buttonText}>I'm Ready</Text>
          </Pressable>

          {countdown !== null && (
            <Text style={styles.countdown}>{countdown}</Text>
          )}
        </View>
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
  overlayWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    padding: 24,
    maxWidth: 700,
    width: "90%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  player: {
    fontSize: 16,
    color: "#f0f0f0",
    textAlign: "center",
    marginVertical: 4,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#1e90ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  countdown: {
    marginTop: 20,
    fontSize: 32,
    color: "red",
    fontWeight: "bold",
  },
});
