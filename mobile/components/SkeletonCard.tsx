import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/colors";

function SkeletonPulse({ className, style }: { className?: string; style?: ViewStyle }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View className={className} style={[style, animStyle]} />;
}

export function SkeletonPecCard() {
  return (
    <View className="m-1.5 min-h-[160px] flex-1 items-center justify-center rounded-[20px] bg-neutral p-4">
      <SkeletonPulse
        className="mb-3 aspect-square w-full self-stretch rounded-2xl"
        style={{ backgroundColor: colors.neutralDark }}
      />
      <SkeletonPulse
        className="h-5 w-20 rounded-lg"
        style={{ backgroundColor: colors.neutralDark }}
      />
    </View>
  );
}

export function SkeletonChip() {
  return (
    <SkeletonPulse
      className="mx-1 h-9 w-[100px] rounded-[20px] bg-neutral"
    />
  );
}
