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
import { getCategoryBgColor } from "@/constants/colors";

interface PecCardProps {
  item: PecItem;
  categoryColor?: string;
}

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export function PecCard({ item, categoryColor }: PecCardProps) {
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
  }, [item.title]);

  const handleLongPress = useCallback(() => {
    Speech.stop();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const imageUri = item.featuredImage?.node?.sourceUrl;

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} style={styles.pressable}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image
          source={imageUri ? { uri: imageUri } : FALLBACK_IMAGE}
          style={styles.image}
          defaultSource={FALLBACK_IMAGE}
        />
        <View style={styles.labelPill}>
          <Text style={styles.label} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function RoutinePecCard({
  id,
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
  }, [title]);

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <Animated.View style={[styles.card, { backgroundColor: bg }, animatedStyle]}>
        <Image source={FALLBACK_IMAGE} style={styles.image} />
        <View style={styles.labelPill}>
          <Text style={styles.label} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    margin: 5,
  },
  card: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  labelPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
    maxWidth: "100%",
  },
  label: {
    fontFamily: "Dongle-Bold",
    fontSize: 20,
    color: "#001D4A",
    textAlign: "center",
    lineHeight: 22,
  },
});
