import React, { useCallback } from "react";
import {
  View,
  Text,
  Image,
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
import { PecItem } from "@/types";
import { colors } from "@/constants/colors";

interface PecCardProps {
  item: PecItem;
  bgColor: string;
}

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export function PecCard({ item, bgColor }: PecCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.08 }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withSpring(1, { damping: 8 })
    );
    glow.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 600 })
    );

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Speech.speak(item.title, { language: "pt-BR" });
  }, [item.title]);

  const handleLongPress = useCallback(() => {
    Speech.stop();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const imageUri = item.featuredImage?.node?.sourceUrl;

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress}>
      <Animated.View style={[styles.card, { backgroundColor: bgColor }, animatedStyle]}>
        <View style={styles.imageWrapper}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Image
            source={imageUri ? { uri: imageUri } : FALLBACK_IMAGE}
            style={styles.image}
            defaultSource={FALLBACK_IMAGE}
          />
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.label} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    elevation: 0,
  },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  ring: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 6,
    borderColor: colors.neutralLight,
    zIndex: 2,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.neutral,
  },
  labelContainer: {
    backgroundColor: `${colors.neutralLight}CC`,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: "90%",
  },
  label: {
    fontFamily: "Dongle-Bold",
    fontSize: 20,
    color: colors.dark,
    textAlign: "center",
    lineHeight: 22,
  },
});
