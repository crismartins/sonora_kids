import React, { useCallback } from "react";
import { View, Text, Image, Pressable, Platform } from "react-native";
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

interface PecCardProps {
  item: PecItem;
}

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export function PecCard({ item }: PecCardProps) {
  const scale = useSharedValue(1);

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

    Speech.speak(item.title, { language: "pt-BR" });
  }, [item.title, scale]);

  const handleLongPress = useCallback(() => {
    Speech.stop();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const imageUri = item.featuredImage?.node?.sourceUrl;
  const imageSource =
    item.localImage ?? (imageUri ? { uri: imageUri } : FALLBACK_IMAGE);

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} className="m-[5px] flex-1">
      <Animated.View
        className="min-h-[150px] flex-1 items-center justify-center rounded-[20px] bg-[#E8F5E9] p-3"
        style={animatedStyle}
      >
        <Image
          source={imageSource}
          className="mb-2.5 h-[88px] w-[88px] rounded-full bg-white"
          defaultSource={FALLBACK_IMAGE}
        />
        <View className="max-w-full rounded-full bg-white px-3 py-[5px]">
          <Text
            className="text-center font-dongle-bold text-xl leading-[22px] text-dark"
            numberOfLines={2}
          >
            {item.title}
          </Text>
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
        <View className="max-w-full rounded-full bg-white px-3 py-[5px]">
          <Text
            className="text-center font-dongle-bold text-xl leading-[22px] text-dark"
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
