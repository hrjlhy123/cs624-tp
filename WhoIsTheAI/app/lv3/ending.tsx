import { useRouter, useLocalSearchParams  } from "expo-router";
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
    title: `Win`,
    content: `
        blablabla about win.`,
  },
  lose: {
    title: `Lose`,
    content: `
        blablabla about lose.`,
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
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.body}>{content.content}</Text>
          </ScrollView>
          <Pressable style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Again</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 12,
    padding: 20,
    maxWidth: 700,
    width: "90%",
    maxHeight: "85%",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#fff",
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: "#fff",
    whiteSpace: "pre-line",
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
