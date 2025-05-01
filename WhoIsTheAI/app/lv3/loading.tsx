import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>&lt;Loading&gt;</Text>
      <Text>Player: </Text>
      <Pressable onPress={() => router.push('/')}>Start</Pressable>
    </View>
  );
}