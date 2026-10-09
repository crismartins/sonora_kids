import React, { useCallback } from "react";
import { View, Pressable, Platform } from "react-native";
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
import { PillText } from "@/components/PillText";

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
  }, [phrase, scale]);

  const handleLongPress = useCallback(() => {
    Speech.stop();
  }, []);

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress}>
      <Animated.View
        className="mx-4 my-1 min-h-[64px] flex-row items-center overflow-hidden rounded-2xl border border-neutral bg-white"
        style={animatedStyle}
      >
        <View className="flex-1 flex-row flex-wrap gap-1 p-2.5">
          {phrase.map((item, idx) => {
            const bgColor = getCategoryBgColor(item.color);
            const textColor = getCategoryColor(item.color);
            return (
              <View
                key={idx}
                className="h-9 items-center justify-center rounded-full px-3"
                style={{ backgroundColor: bgColor }}
              >
                <PillText size={18} style={{ color: textColor }}>
                  {item.text}
                </PillText>
              </View>
            );
          })}
        </View>
        <Pressable onPress={handlePress} className="items-center justify-center px-4 py-[18px]">
          <Ionicons name="volume-high" size={20} color={colors.primary} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}
