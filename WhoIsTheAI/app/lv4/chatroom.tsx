import React, { useEffect, useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";
// import { useRouter } from "expo-router";
import { getSocket } from "../../utils/socketRef";

export default function Chatroom() {
  const [message, setMessage] = useState(``);
  const [chatList, setChatList] = useState<{ name: string; text: string }[]>(
    []
  );
  // const socketRef = useRef<Socket | null>(null);

  // useEffect(() => {
  //   socketRef.current = io("https://wita-api.ngrok.io");
  //   // return () => {socketRef.current?.disconnect()};

  //   socketRef.current.on(`chat`, (data) => {
  //     setChatList((prev) => [...prev, data]);
  //   });

  //   return () => {
  //     socketRef.current?.disconnect();
  //   };
  // }, []);

  // const sendMessage = () => {
  //   if (!message.trim()) return;
  //   console.log("Send:", message);
  //   socketRef.current?.emit(`chat`, message.trim());
  //   setMessage("");
  //   Keyboard.dismiss();
  // };

  const sendMessage = (type: string = "answer", customMessage?: string) => {
    const msg = (customMessage ?? message).trim();
    if (!msg) return;

    console.log(`sendMessage:`, msg)

    getSocket()?.emit(type, msg);
    setMessage("");
    Keyboard.dismiss();
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleChat = (data: { name: string; text: string }) => {
      setChatList((prev) => [...prev, data]);
    };

    socket.on("answer", handleChat);

    sendMessage("question", "What is the capital of France?");

    return () => {
      socket.off("answer", handleChat);
    };
  }, []);

  //   const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>&lt;ChatRoom&gt;</Text>
      <Text>Question: </Text>
      <Text>What is the capital of France?</Text>
      {chatList.map((item, idx) => (
        <Text key={idx}>
          {item.name}: {item.text}
        </Text>
      ))}
      <Text>Answer:</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type your Answer..."
        autoFocus={true}
        returnKeyType="done"
        onSubmitEditing={() => sendMessage("answer")}
      />
    </View>
  );
}
