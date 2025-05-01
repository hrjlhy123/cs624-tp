// I hate typescript so I use javascript in this page to avoid type Stage = 'policy' | 'rules' | 'loading';

import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

const contents = {
  policy: {
    title: `<User Policy>`,
    content: `Blablabla about User Policy...`,
    button: `Agree`,
  },
  rules: {
    title: `<Game Rules>`,
    content: `Blablabla about game rules...`,
    button: `Next`,
  },
};

export default function App() {
  const [stage, setStage] = useState(`policy`);
  const router = useRouter();

  const handlePress = () => {
    switch (stage) {
      case `policy`:
        setStage(`rules`);
        break;

      case `rules`:
        setStage(`loading`);
        router.push(`/lv3/loading`);
        break;

      default:
        break;
    }
  };

  const content = contents[stage];

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{content.title}</Text>
      <Text>{content.content}</Text>
      <Pressable onPress={handlePress}>{content.button}</Pressable>
    </View>
  );
}
