import React, { useCallback, useEffect, useRef } from "react";
import { View, Image, Pressable, ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";
import { PecItem } from "@/types";
import { getCategoryBgColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";
import { useAppSettings } from "@/context/AppSettingsContext";

interface PecCardProps {
  item: PecItem;
  backgroundColor: string;
  onLongPressManage?: () => void;
}

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export function PecCard({ item, backgroundColor, onLongPressManage }: PecCardProps) {
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
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    haptic();
    speak(item.title);
  }, [haptic, item.title, scale, speak]);

  const handleLongPress = useCallback(() => {
    longPressed.current = true;
    stopSpeaking();
    haptic();
    onLongPressManage?.();
  }, [haptic, onLongPressManage, stopSpeaking]);

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
            backgroundColor: settings.highContrast ? "#FFFFFF" : backgroundColor,
            borderRadius: 20,
            borderWidth: settings.highContrast ? 2 : 0,
            borderColor: "#001D4A",
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
  image,
  editing = false,
  onRemove,
  onLongPress,
  onCancelEditing,
  onRemoveFrame,
}: {
  id: string;
  title: string;
  color: string;
  image?: ImageSourcePropType;
  editing?: boolean;
  onRemove?: () => void;
  onLongPress?: () => void;
  onCancelEditing?: () => void;
  onRemoveFrame?: (frame: { x: number; y: number; width: number; height: number }) => void;
}) {
  const { settings, speak, haptic } = useAppSettings();
  const scale = useSharedValue(1);
  const wiggle = useSharedValue(0);
  const removeRef = useRef<View>(null);
  const onRemoveFrameRef = useRef(onRemoveFrame);
  onRemoveFrameRef.current = onRemoveFrame;
  const bg = settings.highContrast ? "#FFFFFF" : getCategoryBgColor(color);

  useEffect(() => {
    if (!editing) {
      cancelAnimation(wiggle);
      wiggle.value = withTiming(0, { duration: 120 });
      return;
    }
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-1.6, { duration: 90 }),
        withTiming(1.6, { duration: 180 }),
        withTiming(0, { duration: 90 }),
      ),
      -1,
      false,
    );
  }, [editing, wiggle]);

  const reportRemoveFrame = useCallback(() => {
    removeRef.current?.measureInWindow((x, y, width, height) => {
      if (width === 0 || height === 0) return;
      onRemoveFrameRef.current?.({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      });
    });
  }, []);

  useEffect(() => {
    if (!editing) return;
    const frame = requestAnimationFrame(reportRemoveFrame);
    return () => cancelAnimationFrame(frame);
  }, [editing, reportRemoveFrame]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${wiggle.value}deg` }],
  }));

  const handlePress = useCallback(() => {
    if (editing) {
      onCancelEditing?.();
      return;
    }
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    haptic();
    speak(title);
  }, [editing, haptic, onCancelEditing, scale, speak, title]);

  return (
    <View className="m-[5px] flex-1">
      <Pressable
        accessibilityLabel={title}
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={450}
      >
        <Animated.View
          className="min-h-[150px] items-center justify-center rounded-[20px] p-3"
          style={[
            {
              backgroundColor: bg,
              borderWidth: settings.highContrast ? 2 : 0,
              borderColor: "#001D4A",
            },
            animatedStyle,
          ]}
        >
          <Image
            source={image ?? FALLBACK_IMAGE}
            className="mb-2.5 h-[88px] w-[88px] rounded-full bg-white"
          />
          <View className="max-w-full items-center justify-center rounded-full bg-white px-3 py-1">
            <PillText size={20} numberOfLines={2} style={{ color: "#001D4A" }}>
              {title}
            </PillText>
          </View>
        </Animated.View>
      </Pressable>
      {editing && onRemove ? (
        <View ref={removeRef} collapsable={false} className="absolute right-1 top-1" onLayout={reportRemoveFrame}>
          <Pressable
            accessibilityLabel={`Tirar ${title} da rotina`}
            onPress={onRemove}
            className="h-8 w-8 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: "#001D4A",
              shadowOpacity: 0.16,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: 3,
            }}
          >
            <Ionicons name="close" size={18} color="#D32F2F" />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
