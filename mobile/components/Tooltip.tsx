import { useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

const BUBBLE_SHADOW: ViewStyle = {
  shadowColor: "#1B2B41",
  shadowOpacity: 0.14,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
};

const DOT_SHADOW: ViewStyle = {
  shadowColor: "#1B2B41",
  shadowOpacity: 0.16,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 3,
};

export type TooltipAlign = "center" | "end";

export function Tooltip({ label, align = "center" }: { label: string; align?: TooltipAlign }) {
  const [width, setWidth] = useState(0);
  const end = align === "end";

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        if (next !== width) setWidth(next);
      }}
      style={{
        position: "absolute",
        bottom: "100%",
        zIndex: 30,
        maxWidth: 220,
        opacity: end || width > 0 ? 1 : 0,
        ...(end ? { right: 0 } : { left: "50%", marginLeft: -(width / 2) }),
      }}
    >
      <View style={{ paddingBottom: 22, alignItems: end ? "flex-end" : "center" }}>
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 24,
            paddingHorizontal: 18,
            paddingVertical: 12,
            ...BUBBLE_SHADOW,
          }}
        >
          <Text className="text-center font-quicksand text-base" style={{ color: colors.dark }}>
            {label}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.white,
            bottom: 14,
            ...(end ? { right: 36 } : { left: "50%", marginLeft: -10 }),
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.white,
            bottom: 4,
            ...(end ? { right: 24 } : { left: "50%", marginLeft: -6 }),
            ...DOT_SHADOW,
          }}
        />
      </View>
    </View>
  );
}
