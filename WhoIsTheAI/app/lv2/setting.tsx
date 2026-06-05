import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  GameSettings,
  getGameSettings,
  updateGameSettings,
} from "../../utils/gameSettings";

const defaultSettings: GameSettings = {
  autoFocusAnswer: true,
  showCountdown: true,
  compactMode: false,
};

export default function Setting() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compact = width < 420 || height < 680;
  const [settings, setSettings] = useState<GameSettings>(() =>
    getGameSettings()
  );

  const updateSetting = (next: Partial<GameSettings>) => {
    setSettings(updateGameSettings(next));
  };

  const resetSettings = () => {
    setSettings(updateGameSettings(defaultSettings));
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <ScrollView
        contentContainerStyle={[
          styles.overlayWrapper,
          compact && styles.overlayWrapperCompact,
        ]}
      >
        <View style={[styles.overlay, compact && styles.overlayCompact]}>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            Settings
          </Text>

          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Answer focus</Text>
                <Text style={styles.settingHint}>Focus input on each round</Text>
              </View>
              <Switch
                value={settings.autoFocusAnswer}
                onValueChange={(value) =>
                  updateSetting({ autoFocusAnswer: value })
                }
                trackColor={{ false: "#555", true: "#5caeff" }}
                thumbColor={settings.autoFocusAnswer ? "#fff" : "#ddd"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Countdown</Text>
                <Text style={styles.settingHint}>Show round timer</Text>
              </View>
              <Switch
                value={settings.showCountdown}
                onValueChange={(value) => updateSetting({ showCountdown: value })}
                trackColor={{ false: "#555", true: "#5caeff" }}
                thumbColor={settings.showCountdown ? "#fff" : "#ddd"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Compact layout</Text>
                <Text style={styles.settingHint}>Use tighter game spacing</Text>
              </View>
              <Switch
                value={settings.compactMode}
                onValueChange={(value) => updateSetting({ compactMode: value })}
                trackColor={{ false: "#555", true: "#5caeff" }}
                thumbColor={settings.compactMode ? "#fff" : "#ddd"}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={resetSettings}>
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => router.push("/lv2/intro")}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.homeButtonText}>Back Home</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  overlayWrapperCompact: {
    padding: 16,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
  },
  overlayCompact: {
    padding: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  titleCompact: {
    fontSize: 24,
  },
  section: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  settingRow: {
    width: "100%",
    minHeight: 64,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.07)",
    gap: 12,
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  settingHint: {
    color: "#cfcfcf",
    fontSize: 13,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  button: {
    flex: 1,
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.34)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  homeButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  homeButtonText: {
    color: "#d8d8d8",
    fontSize: 14,
    fontWeight: "600",
  },
});
