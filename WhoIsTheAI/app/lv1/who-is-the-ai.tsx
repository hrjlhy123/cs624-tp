import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function WhoIsTheAI() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.overlayWrapper}>
        <View style={styles.overlay}>
          <Image
            source={require('../../assets/images/ai-brain.jpg')}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>Who is the AI?</Text>
          <Text style={styles.description}>
            This screen will introduce which player is the AI in the game.
            More detailed explanation can go here.
          </Text>
          <Pressable style={styles.button} onPress={() => router.push('/lv2/intro')}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 700,
    marginHorizontal: 20,
  },
  image: {
    width: 250,
    height: 180,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 600,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
