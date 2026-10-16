import React, { useCallback, useRef } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { PhraseItem } from "@/types";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";
import { useAppSettings } from "@/context/AppSettingsContext";
import { recordWordUse } from "@/services/wordUsage";

interface PhraseCardProps {
  phrase: PhraseItem[];
  onManage?: () => void;
}

export function PhraseCard({ phrase, onManage }: PhraseCardProps) {
  const { settings, speak, stopSpeaking, haptic } = useAppSettings();
  const scale = useSharedValue(1);
  const longPressed = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    scale.value = withSequence(
      withTiming(0.98, { duration: 60 }),
      withSpring(1, { damping: 12 })
    );
    haptic();
    speak(phrase.map((item) => item.text).join(" "));
    phrase.forEach((item) => recordWordUse(item.text, item.color));
  }, [haptic, phrase, scale, speak]);

  const handleLongPress = useCallback(() => {
    longPressed.current = true;
    stopSpeaking();
    if (!onManage) return;
    haptic();
    onManage();
  }, [haptic, onManage, stopSpeaking]);

  return (
    <Animated.View
      className="mx-4 my-1 min-h-[64px] flex-row items-center overflow-hidden rounded-2xl border border-neutral bg-white"
      style={animatedStyle}
    >
      <Pressable
        accessibilityLabel={phrase.map((item) => item.text).join(" ")}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={450}
        className="flex-1 flex-row flex-wrap gap-1 p-2.5"
      >
        {phrase.map((item, idx) => {
          const bgColor = settings.highContrast
            ? getCategoryColor(item.color)
            : getCategoryBgColor(item.color);
          const textColor = settings.highContrast ? "#FFFFFF" : getCategoryColor(item.color);
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
      </Pressable>
      {onManage ? (
        <Pressable
          accessibilityLabel="Opções da frase"
          onPress={onManage}
          className="h-full items-center justify-center px-2"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.neutralDark} />
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel="Ouvir frase"
        onPress={handlePress}
        className="items-center justify-center px-4 py-[18px]"
      >
        <Ionicons name="volume-high" size={20} color={colors.primary} />
      </Pressable>
    </Animated.View>
  );
}
