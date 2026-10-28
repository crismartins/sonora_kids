import React, { useCallback, useEffect, useRef } from "react";
import { View, Image, Pressable, ImageSourcePropType, type ViewInstance } from "react-native";
import { SolarIcon } from "@/components/SolarIcon";
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
import { colors, getCategoryBgColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";
import { useAppSettings } from "@/context/AppSettingsContext";
import { recordWordUse } from "@/services/wordUsage";

interface PecCardProps {
  item: PecItem;
  backgroundColor: string;
  colorName?: string;
  onLongPressManage?: () => void;
  onPress?: () => void;
  compact?: boolean;
}

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export function PecCard({ item, backgroundColor, colorName = "blue", onLongPressManage, onPress, compact = false }: PecCardProps) {
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

    if (onPress) {
      onPress();
      return;
    }
    haptic();
    speak(item.title);
    recordWordUse(item.title, colorName);
  }, [colorName, haptic, item.title, onPress, scale, speak]);

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
      className={compact ? undefined : "m-[5px] self-stretch"}
      style={compact ? { width: 120 } : { flexGrow: 1 }}
    >
      <Animated.View
        className="items-center justify-start self-stretch"
        style={[
          {
            flexGrow: compact ? undefined : 1,
            alignSelf: "stretch",
            backgroundColor: settings.highContrast ? "#FFFFFF" : backgroundColor,
            borderRadius: compact ? 16 : 20,
            borderWidth: settings.highContrast ? 2 : 0,
            borderColor: colors.dark,
            minHeight: compact ? 132 : 150,
            padding: compact ? 8 : 12,
            alignItems: "center",
            justifyContent: "flex-start",
          },
          animatedStyle,
        ]}
      >
        <View className={`aspect-square w-full self-stretch overflow-hidden bg-white ${compact ? "mb-1.5 rounded-xl" : "mb-2.5 rounded-2xl"}`}>
          <Image
            source={imageSource}
            className="h-full w-full"
            resizeMode="cover"
            defaultSource={FALLBACK_IMAGE}
          />
        </View>
        <View className="max-w-full items-center justify-center px-3 py-1">
          <PillText size={compact ? 14 : 20} numberOfLines={2} style={{ color: colors.dark }}>
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
  const removeRef = useRef<ViewInstance>(null);
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
    recordWordUse(title, color);
  }, [color, editing, haptic, onCancelEditing, scale, speak, title]);

  return (
    <View className="m-[5px] self-stretch" style={{ flexGrow: 1 }}>
      <Pressable
        accessibilityLabel={title}
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={450}
        className="self-stretch"
        style={{ flexGrow: 1 }}
      >
        <Animated.View
          className="min-h-[150px] items-center justify-start self-stretch rounded-[20px] p-3"
          style={[
            {
              flexGrow: 1,
              alignSelf: "stretch",
              backgroundColor: bg,
              borderWidth: settings.highContrast ? 2 : 0,
              borderColor: colors.dark,
              justifyContent: "flex-start",
            },
            animatedStyle,
          ]}
        >
          <View className="mb-2.5 aspect-square w-full self-stretch overflow-hidden rounded-2xl bg-white">
            <Image
              source={image ?? FALLBACK_IMAGE}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
          <View className="max-w-full items-center justify-center px-3 py-1">
            <PillText size={20} numberOfLines={2} style={{ color: colors.dark }}>
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
              shadowColor: colors.dark,
              shadowOpacity: 0.16,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: 3,
            }}
          >
            <SolarIcon name="close-circle" size={18} color={colors.danger} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
