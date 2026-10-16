import React, { useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { useAppSettings } from "@/context/AppSettingsContext";

export function ActivityChrome({
  title,
  announce = true,
  onBack,
  children,
}: {
  title: string;
  announce?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { settings, speak } = useAppSettings();
  const announced = useRef(false);

  useEffect(() => {
    if (!announce || announced.current || !settings.autoSpeakCategories) return;
    announced.current = true;
    speak(title);
  }, [announce, settings.autoSpeakCategories, speak, title]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="h-14 flex-row items-center px-2">
        <Pressable
          accessibilityLabel="Voltar"
          onPress={() => (onBack ? onBack() : router.back())}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        >
          <Ionicons name="chevron-back" size={28} color={colors.dark} />
        </Pressable>
        <Text className="flex-1 text-center font-quicksand text-[22px] text-dark" numberOfLines={1}>
          {title}
        </Text>
        <View className="w-11" />
      </View>
      {children}
    </View>
  );
}

export function ActivityDone({
  title,
  detail,
  againLabel,
  onAgain,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  detail: string;
  againLabel: string;
  onAgain: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { speak } = useAppSettings();

  useEffect(() => {
    speak(title);
  }, [speak, title]);

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="mb-5 h-28 w-28 items-center justify-center rounded-full bg-light">
        <Ionicons name="star" size={64} color={colors.primary} />
      </View>
      <Text className="text-center font-quicksand text-4xl text-dark">{title}</Text>
      <Text className="mt-2 text-center font-quicksand text-xl text-neutral-dark">{detail}</Text>
      <Pressable
        accessibilityLabel={againLabel}
        onPress={onAgain}
        className="mt-8 h-14 w-full items-center justify-center rounded-full bg-primary active:opacity-90"
      >
        <Text className="font-quicksand text-xl text-white">{againLabel}</Text>
      </Pressable>
      {secondaryLabel && onSecondary ? (
        <Pressable
          accessibilityLabel={secondaryLabel}
          onPress={onSecondary}
          className="mt-3 h-12 w-full items-center justify-center rounded-full active:opacity-70"
        >
          <Text className="font-quicksand text-lg text-primary">{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
