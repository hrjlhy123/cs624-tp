import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const contents = {
  win: {
    title: "You Win!",
    content:
      "Congratulations. The humans found the AI before it could outlast the room.",
  },
  lose: {
    title: "AI Wins!",
    content:
      "The AI survived the vote. Check the answers, adjust your strategy, and try again.",
  },
};

export default function Ending() {
  const [stage, setStage] = useState<"win" | "lose">("win");
  const { result } = useLocalSearchParams();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compact = width < 420 || height < 680;

  useEffect(() => {
    if (result === "win" || result === "lose") {
      setStage(result);
    }
  }, [result]);

  const handlePress = () => {
    router.replace("/lv3/loading");
  };

  const content = contents[stage];

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlayWrapper}>
        <View style={[styles.overlay, compact && styles.overlayCompact]}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text
              style={[
                styles.title,
                compact && styles.titleCompact,
                stage === "win" ? styles.winColor : styles.loseColor,
              ]}
            >
              {content.title}
            </Text>
            <Text style={styles.body}>{content.content}</Text>
          </ScrollView>

          <Pressable style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>
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
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 12,
    padding: 24,
    maxWidth: 620,
    width: "100%",
    maxHeight: "85%",
    alignItems: "center",
  },
  overlayCompact: {
    padding: 18,
  },
  scrollContainer: {
    paddingBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 25,
  },
  winColor: {
    color: "#00ffae",
  },
  loseColor: {
    color: "#ff6b6b",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#f0f0f0",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 16,
    width: "100%",
    maxWidth: 320,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});
