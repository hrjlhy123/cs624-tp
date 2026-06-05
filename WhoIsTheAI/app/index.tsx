import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compact = width < 420 || height < 680;

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/background.jpg")}
        style={styles.background}
        resizeMode="cover"
        blurRadius={2}
      />
      <ScrollView
        contentContainerStyle={[
          styles.overlay,
          compact && styles.overlayCompact,
        ]}
      >
        <View style={[styles.panel, compact && styles.panelCompact]}>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            Who is the AI?
          </Text>
          <Text style={styles.subtitle}>Team Members</Text>
          <Text style={styles.authors}>
            Ruojie Hao / Shila Jahanbin / Christian Morris / Zeinep Zhorobekova
          </Text>

          <View style={styles.buttonGroup}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/lv2/intro")}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push("/lv1/who-is-the-ai")}
            >
              <Text style={styles.secondaryButtonText}>How It Works</Text>
            </Pressable>
            <View style={styles.secondaryRow}>
              <Pressable
                style={styles.smallButton}
                onPress={() => router.push("/lv2/dashboard")}
              >
                <Text style={styles.secondaryButtonText}>Dashboard</Text>
              </Pressable>
              <Pressable
                style={styles.smallButton}
                onPress={() => router.push("/lv2/setting")}
              >
                <Text style={styles.secondaryButtonText}>Settings</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  overlayCompact: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  panel: {
    width: "100%",
    maxWidth: 520,
    alignItems: "center",
  },
  panelCompact: {
    maxWidth: 380,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 16,
    color: "#d8d8d8",
    marginBottom: 4,
  },
  authors: {
    fontSize: 14,
    color: "#c0c0c0",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonGroup: {
    width: "100%",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#1e90ff",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  smallButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 15,
  },
});
