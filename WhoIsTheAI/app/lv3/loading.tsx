import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { getGameSettings } from "../../utils/gameSettings";
import { getSocket, initSocket } from "../../utils/socketRef";

type Player = {
  name: string;
  ready: boolean;
};

export default function Loading() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const settings = getGameSettings();
  const compact = settings.compactMode || width < 420 || height < 680;
  const playersRef = useRef<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReadySent, setIsReadySent] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    const socket = initSocket();

    const updateConnected = () => {
      setIsConnected(socket.connected);
      setConnectionError("");
      socket.emit("playerlist");
    };

    const handleConnectError = () => {
      setIsConnected(false);
      setConnectionError("Unable to connect to the game server.");
    };

    const handlePlayers = (playerList: Player[]) => {
      const list = Array.isArray(playerList) ? playerList : [];
      const humanPlayers = list.filter((player) => player.name !== "AI");
      setPlayers(humanPlayers);
      playersRef.current = list;
    };

    const handleCountdownComplete = () => {
      router.replace({
        pathname: "/lv4/chatroom",
        params: { players: JSON.stringify(playersRef.current) },
      });
    };

    socket.on("connect", updateConnected);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("players", handlePlayers);
    socket.on("countdown", setCountdown);
    socket.on("countdown complete", handleCountdownComplete);

    if (socket.connected) {
      updateConnected();
    } else {
      socket.connect();
      socket.emit("playerlist");
    }

    return () => {
      socket.off("connect", updateConnected);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect");
      socket.off("players", handlePlayers);
      socket.off("countdown", setCountdown);
      socket.off("countdown complete", handleCountdownComplete);
    };
  }, [router]);

  const markReady = () => {
    const socket = getSocket();
    if (!socket || !socket.connected || isReadySent) return;
    socket.emit("ready");
    setIsReadySent(true);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlayWrapper}>
        <View style={[styles.overlay, compact && styles.overlayCompact]}>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            Loading
          </Text>
          <Text style={styles.statusText}>
            {isConnected ? "Connected" : "Connecting..."}
          </Text>
          {connectionError ? (
            <Text style={styles.errorText}>{connectionError}</Text>
          ) : null}

          <Text style={styles.subtitle}>Players</Text>
          <ScrollView style={styles.playerList}>
            {players.length ? (
              players.map((player) => (
                <Text key={player.name} style={styles.player}>
                  {player.name} - {player.ready ? "ready" : "waiting"}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>Waiting for players...</Text>
            )}
          </ScrollView>

          <Pressable
            style={[
              styles.button,
              (!isConnected || isReadySent) && styles.buttonDisabled,
            ]}
            onPress={markReady}
            disabled={!isConnected || isReadySent}
          >
            <Text style={styles.buttonText}>
              {isReadySent ? "Ready" : "I'm Ready"}
            </Text>
          </Pressable>

          {settings.showCountdown && countdown !== null ? (
            <Text style={styles.countdown}>{countdown}</Text>
          ) : null}
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
    padding: 18,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    borderRadius: 12,
    padding: 24,
    maxWidth: 620,
    width: "100%",
    alignItems: "center",
  },
  overlayCompact: {
    padding: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 22,
  },
  statusText: {
    color: "#bde0ff",
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: {
    color: "#ffd1d1",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  playerList: {
    width: "100%",
    maxHeight: 220,
    marginBottom: 18,
  },
  player: {
    fontSize: 16,
    color: "#f0f0f0",
    textAlign: "center",
    marginVertical: 4,
  },
  emptyText: {
    fontSize: 15,
    color: "#cfcfcf",
    textAlign: "center",
    paddingVertical: 12,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 180,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  countdown: {
    marginTop: 20,
    fontSize: 32,
    color: "#ff5c5c",
    fontWeight: "bold",
  },
});
