import { useRouter } from "expo-router";
import { useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const contents = {
  policy: {
    title: `User Policy`,
    content: `
Overview:
As part of the “Who is the AI?” mobile app, this page informs users about privacy, data usage, and gameplay expectations.

Purpose:
This page explains how your data is collected, stored, used, and protected to build user trust.

Design Considerations:
- Scrollable Content for long policies
- Sections like Introduction, Data Collection, Security
- Mobile-friendly font and contrast
- Contact info for questions

Contact:
support@whoistheai.com
    `,
    button: `Agree`,
  },
  rules: {
    title: `Game Rules`,
    content: `
Purpose:
The Rules Page clearly outlines the gameplay rules to ensure users understand how the game works and what behavior is expected. This reduces confusion and enhances fair play.

Design Considerations:
- Numbered List Format:
Presenting rules as a numbered list improves clarity and helps users follow the sequence of gameplay steps.

- Concise Wording:
Each rule is short and straightforward, avoiding jargon to be accessible to a broad user base.

- ScrollView:
A scrollable container ensures all rules are viewable regardless of device screen size.

- Consistent Styling:
Typography and spacing match the Policy Page for UI consistency, supporting a professional app look and feel.

- Focus on Fair Play:
Including rules against cheating and spam helps maintain a respectful and enjoyable gaming environment.

Technology Stack Related to UI Design:
- React Native
- OpenAI API
- MongoDB
- WebSocket
    `,
    button: `Next`,
  },
};

export default function Intro() {
  const [stage, setStage] = useState("policy");
  const router = useRouter();

  const handlePress = () => {
    if (stage === "policy") setStage("rules");
    else if (stage === "rules") router.push("/lv3/loading");
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
