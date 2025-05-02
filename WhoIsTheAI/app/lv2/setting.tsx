import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;Setting&gt;</Text>
      <Text>Blablabla... </Text>
      <Pressable onPress={() => router.push("/")}>
        <Text>Start</Text>
      </Pressable>
    </View>
  );
}
