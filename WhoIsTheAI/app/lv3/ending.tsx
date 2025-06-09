import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const contents = {
  win: {
    title: `🎉 You Win!`,
    content: `Congratulations! You outsmarted the AI and proved your human wit. Celebrate your victory and play again to defend your title.`,
  },
  lose: {
    title: `🤖 AI Wins!`,
    content: `Oh no! The AI was smarter this time. But don’t worry — analyze the game, try new strategies, and come back stronger!`,
  },
};

export default function Ending() {
  const [stage, setStage] = useState("win");
  const { result } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (result === "win" || result === "lose") {
      setStage(result);
    }
  }, [result]);

  const handlePress = () => {
    router.push("/lv3/loading");
  };

  const content = contents[stage];

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlayWrapper}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text
              style={[
                styles.title,
                stage === "win" ? styles.winColor : styles.loseColor,
              ]}
            >
              {content.title}
            </Text>
            <Text style={styles.body}>{content.content}</Text>
          </ScrollView>

          <Pressable style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>🔁 Play Again</Text>
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
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 16,
    padding: 24,
    maxWidth: 700,
    width: "90%",
    maxHeight: "85%",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  winColor: {
    color: "#00ffae",
  },
  loseColor: {
    color: "#ff5c5c",
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
    borderRadius: 10,
    marginTop: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
