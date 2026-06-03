import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/colors";

function SkeletonPulse({ style }: { style: object }) {
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
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, animStyle]} />;
}

export function SkeletonPecCard() {
  return (
    <View style={styles.card}>
      <SkeletonPulse style={styles.circle} />
      <SkeletonPulse style={styles.label} />
    </View>
  );
}

export function SkeletonChip() {
  return <SkeletonPulse style={styles.chip} />;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    backgroundColor: colors.neutral,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.neutralDark,
    marginBottom: 12,
  },
  label: {
    width: 80,
    height: 20,
    borderRadius: 8,
    backgroundColor: colors.neutralDark,
  },
  chip: {
    width: 100,
    height: 36,
    borderRadius: 20,
    backgroundColor: colors.neutral,
    marginHorizontal: 4,
  },
});
