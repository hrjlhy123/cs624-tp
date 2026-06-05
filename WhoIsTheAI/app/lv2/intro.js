import { useRouter } from "expo-router";
import { useState } from "react";
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
  policy: {
    title: "User Policy",
    content: `Overview
Who is the AI? uses a real-time socket connection so players can answer, vote, and see game progress together.

Data Use
Gameplay statistics may be saved for the dashboard, including total games, win counts, and average game time. Chat answers are used during the live round.

Fair Play
Do not spam, impersonate others, or share harmful content. The game works best when everyone answers honestly enough to keep the deduction fair.`,
    button: "Agree",
  },
  rules: {
    title: "Game Rules",
    content: `1. Each game needs at least two human players plus one hidden AI.
2. All active players answer the same question each round.
3. After the answers appear, vote for the player you think is the AI.
4. The top-voted player is eliminated.
5. Humans win when the AI is eliminated.
6. The AI wins if it outlasts the humans.`,
    button: "Find Players",
  },
};

export default function Intro() {
  const [stage, setStage] = useState("policy");
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compact = width < 420 || height < 680;

  const handlePress = () => {
    if (stage === "policy") {
      setStage("rules");
      return;
    }

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
            <Text style={[styles.title, compact && styles.titleCompact]}>
              {content.title}
            </Text>
            <Text style={styles.body}>{content.content}</Text>
          </ScrollView>
          <Pressable style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>{content.button}</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    borderRadius: 12,
    padding: 20,
    maxWidth: 660,
    width: "100%",
    maxHeight: "86%",
  },
  overlayCompact: {
    padding: 16,
    maxHeight: "90%",
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
    color: "#fff",
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 19,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: "#fff",
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
