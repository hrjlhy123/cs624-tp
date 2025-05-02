import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;Who Is The AI&gt;</Text>
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
