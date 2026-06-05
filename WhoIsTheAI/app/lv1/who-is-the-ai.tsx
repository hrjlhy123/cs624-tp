import React from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

export default function WhoIsTheAI() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compact = width < 420 || height < 700;

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <ScrollView
        contentContainerStyle={[
          styles.overlayWrapper,
          compact && styles.overlayWrapperCompact,
        ]}
      >
        <View style={[styles.overlay, compact && styles.overlayCompact]}>
          <Image
            source={require("../../assets/images/ai-brain.jpg")}
            style={[styles.image, compact && styles.imageCompact]}
            resizeMode="cover"
          />
          <Text style={[styles.title, compact && styles.titleCompact]}>
            How It Works
          </Text>
          <Text style={styles.description}>
            Every round, all players answer the same question. One hidden AI
            tries to sound human. Read the answers, vote carefully, and remove
            the AI before it outlasts the group.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => router.push("/lv2/intro")}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlayWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  overlayWrapperCompact: {
    padding: 16,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    maxWidth: 640,
    width: "100%",
  },
  overlayCompact: {
    padding: 18,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginBottom: 20,
  },
  imageCompact: {
    height: 160,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 22,
  },
  description: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 22,
    maxWidth: 560,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  button: {
    flex: 1,
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
