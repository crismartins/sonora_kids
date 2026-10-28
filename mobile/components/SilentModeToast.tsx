import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SolarIcon } from "@/components/SolarIcon";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";
import { hideSilentModeToast, subscribeSilentModeToast } from "@/services/silentMode";

export function SilentModeToast() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useAppSettings();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeSilentModeToast(setMessage), []);

  if (!message) return null;

  const fontSize = Math.round(16 * fontScale);

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: insets.top + 62,
        left: 16,
        right: 16,
        zIndex: 80,
      }}
    >
      <Pressable
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        onPress={hideSilentModeToast}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: colors.neutralLight,
          borderRadius: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          shadowColor: colors.dark,
          shadowOpacity: 0.14,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: getCategoryBgColor("amber"),
          }}
        >
          <SolarIcon name="volume-cross" size={22} color={getCategoryColor("amber")} />
        </View>
        <Text
          style={{
            flex: 1,
            fontFamily: FONT_FAMILY,
            fontSize,
            lineHeight: Math.round(fontSize * 1.35),
            color: colors.dark,
          }}
        >
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
