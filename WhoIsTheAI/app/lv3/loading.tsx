import { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';

export default function App() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  // const [socket, setSocket] = useState<Socket | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('https://e7e54f1f7904.ngrok.app'); 

    socketRef.current.on('players', (data) => {
      setPlayers(data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>&lt;Loading&gt;</Text>
      <Text>Players:</Text>
      {players.map((p, i) => (
        <Text key={i}>{p}</Text>
      ))}
      <Pressable onPress={() => router.push('/')}>
        <Text>Start</Text>
      </Pressable>
    </View>
  );
}
