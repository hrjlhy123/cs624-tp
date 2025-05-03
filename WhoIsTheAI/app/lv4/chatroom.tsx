import React, { useState, useEffect, useRef } from "react";
import { Text, View, TextInput, Pressable, Keyboard } from "react-native";
// import { useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";

export default function Chatroom() {
  const [message, setMessage] = useState(``);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("https://e7e54f1f7904.ngrok.app");
    // return () => socketRef.current?.disconnect();
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    console.log("Send:", message);
    socketRef.current?.emit(`chat`, message.trim());
    setMessage("");
    Keyboard.dismiss();
  };

  //   const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;ChatRoom&gt;</Text>
      <Text>Question: </Text>
      <Text>What is the capital of France?</Text>
      <Text>Answer:</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type your Answer..."
        autoFocus={true}
        returnKeyType="done"
        onSubmitEditing={sendMessage}
      />
    </View>
  );
}
