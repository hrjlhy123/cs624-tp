export type GameSettings = {
  autoFocusAnswer: boolean;
  showCountdown: boolean;
  compactMode: boolean;
};

let currentSettings: GameSettings = {
  autoFocusAnswer: true,
  showCountdown: true,
  compactMode: false,
};

export function getGameSettings() {
  return currentSettings;
}

export function updateGameSettings(settings: Partial<GameSettings>) {
  currentSettings = {
    ...currentSettings,
    ...settings,
  };

  return currentSettings;
}
