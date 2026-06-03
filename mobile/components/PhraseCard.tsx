import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { PhraseItem } from "@/types";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";

interface PhraseCardProps {
  phrase: PhraseItem[];
}

export function PhraseCard({ phrase }: PhraseCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 60 }),
      withSpring(1, { damping: 12 })
    );
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const fullPhrase = phrase.map((p) => p.text).join(" ");
    Speech.speak(fullPhrase, { language: "pt-BR" });
  }, [phrase]);

  const handleLongPress = useCallback(() => {
    Speech.stop();
  }, []);

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.wordsRow}>
          {phrase.map((item, idx) => {
            const bgColor = getCategoryBgColor(item.color);
            const textColor = getCategoryColor(item.color);
            return (
              <View
                key={idx}
                style={[styles.wordCell, { backgroundColor: bgColor }]}
              >
                <Text style={[styles.wordText, { color: textColor }]}>
                  {item.text}
                </Text>
              </View>
            );
          })}
        </View>
        <Pressable onPress={handlePress} style={styles.soundButton}>
          <Ionicons name="volume-high" size={20} color={colors.primary} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: "hidden",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4F4FF",
    minHeight: 64,
  },
  wordsRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    padding: 10,
  },
  wordCell: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  wordText: {
    fontFamily: "Dongle-Bold",
    fontSize: 20,
    lineHeight: 22,
  },
  soundButton: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
