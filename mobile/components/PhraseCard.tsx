import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
  const elevation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 60 }),
      withSpring(1, { damping: 10 })
    );
    elevation.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 600 })
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
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.wordsRow}>
          {phrase.map((item, idx) => {
            const bgColor = getCategoryBgColor(item.color);
            const textColor = getCategoryColor(item.color);
            const isLast = idx === phrase.length - 1;
            return (
              <View
                key={idx}
                style={[
                  styles.wordCell,
                  { backgroundColor: bgColor },
                  !isLast && styles.wordCellBorder,
                ]}
              >
                <Text style={[styles.wordText, { color: textColor }]}>
                  {item.text}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.soundButton}>
          <Ionicons name="volume-high" size={20} color={colors.primary} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.neutral,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    overflow: "hidden",
    alignItems: "center",
  },
  wordsRow: {
    flex: 1,
    flexDirection: "row",
  },
  wordCell: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  wordCellBorder: {
    borderRightWidth: 1,
    borderRightColor: `${colors.dark}22`,
  },
  wordText: {
    fontFamily: "Dongle-Bold",
    fontSize: 22,
    textAlign: "center",
    lineHeight: 24,
  },
  soundButton: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
