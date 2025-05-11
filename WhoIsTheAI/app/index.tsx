import { Text, View, Pressable, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/background.jpg")}
        style={styles.background}
        resizeMode="cover"
        blurRadius={2}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Who is the AI?</Text>
        <Text style={styles.subtitle}>Team Members:</Text>
        <Text style={styles.authors}>Ruojie Hao · Shila Jahanbin · Christian Morris · Zeinep Zhorobekova</Text>

        <Pressable style={styles.button} onPress={() => router.push("/lv1/who-is-the-ai")}>
          <Text style={styles.buttonText}>Who is the AI</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.push("/lv2/intro")}>
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.push("/lv2/dashboard")}>
          <Text style={styles.buttonText}>Dashboard</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.push("/lv2/setting")}>
          <Text style={styles.buttonText}>Setting</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FAQ</Text>
          <Text style={styles.footerText}>·</Text>
          <Text style={styles.footerText}>Privacy Policy</Text>
          <Text style={styles.footerText}>·</Text>
          <Text style={styles.footerText}>Terms of Use</Text>
        </View>
      </View>
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 4,
  },
  authors: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginVertical: 6,
    minWidth: 180,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    position: "absolute",
    bottom: 24,
  },
  footerText: {
    color: "#aaa",
    fontSize: 12,
  },
});



/*import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable onPress={() => router.push("/lv1/who-is-the-ai")}>
        <Text>Who is the AI?</Text>
      </Pressable>
      <Text>
        Author: Ruojie Hao, Shila Jahanbin, Christian Morris, Zeinep Zhorobekova
      </Text>
      <Pressable onPress={() => router.push("/lv2/intro")}>
        <Text>Start</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/lv2/dashboard")}>
        <Text>Dashboard</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/lv2/setting")}>
        <Text>Setting</Text>
      </Pressable>
    </View>
  );
}
*/