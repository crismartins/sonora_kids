import React, { useCallback, useRef } from "react";
import { View, Image, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { PecItem } from "@/types";
import { getCategoryBgColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";

interface PecCardProps {
  item: PecItem;
  backgroundColor: string;
  onLongPressManage?: () => void;
}

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export function PecCard({ item, backgroundColor, onLongPressManage }: PecCardProps) {
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
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Speech.speak(item.title, { language: "pt-BR" });
  }, [item.title, scale]);

  const handleLongPress = useCallback(() => {
    longPressed.current = true;
    Speech.stop();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPressManage?.();
  }, [onLongPressManage]);

  const imageUri = item.featuredImage?.node?.sourceUrl;
  const imageSource =
    item.localImage ?? (imageUri ? { uri: imageUri } : FALLBACK_IMAGE);

  return (
    <Pressable
      accessibilityLabel={item.title}
      onPress={handlePress}
      onLongPress={onLongPressManage ? handleLongPress : undefined}
      delayLongPress={450}
      className="m-[5px] flex-1"
    >
      <Animated.View
        className="min-h-[150px] flex-1 items-center justify-center rounded-[20px] p-3"
        style={[
          {
            backgroundColor,
            borderRadius: 20,
            minHeight: 150,
            padding: 12,
            alignItems: "center",
            justifyContent: "center",
          },
          animatedStyle,
        ]}
      >
        <Image
          source={imageSource}
          className="mb-2.5 h-[88px] w-[88px] rounded-full bg-white"
          defaultSource={FALLBACK_IMAGE}
        />
        <View className="max-w-full items-center justify-center rounded-full bg-white px-3 py-1">
          <PillText size={20} numberOfLines={2} style={{ color: "#001D4A" }}>
            {item.title}
          </PillText>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function RoutinePecCard({
  title,
  color,
}: {
  id: string;
  title: string;
  color: string;
}) {
  const scale = useSharedValue(1);
  const bg = getCategoryBgColor(color);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Speech.speak(title, { language: "pt-BR" });
  }, [title, scale]);

  return (
    <Pressable onPress={handlePress} className="m-[5px] flex-1">
      <Animated.View
        className="min-h-[150px] flex-1 items-center justify-center rounded-[20px] p-3"
        style={[{ backgroundColor: bg }, animatedStyle]}
      >
        <Image
          source={FALLBACK_IMAGE}
          className="mb-2.5 h-[88px] w-[88px] rounded-full bg-white"
        />
        <View className="max-w-full items-center justify-center rounded-full bg-white px-3 py-1">
          <PillText size={20} numberOfLines={2} style={{ color: "#001D4A" }}>
            {title}
          </PillText>
        </View>
      </Animated.View>
    </Pressable>
  );
}
