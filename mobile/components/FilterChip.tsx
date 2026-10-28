import { LayoutChangeEvent, Pressable } from "react-native";
import { PillText } from "@/components/PillText";
import { colors } from "@/constants/colors";

export function FilterChip({
  label,
  selected,
  onPress,
  onLayout,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      onLayout={onLayout}
      className={`h-10 items-center justify-center rounded-full px-4 ${selected ? "bg-primary-wash" : "bg-muted"}`}
    >
      <PillText
        size={16}
        numberOfLines={1}
        style={{ color: selected ? colors.primary : colors.neutralDark, letterSpacing: 0.4 }}
      >
        {label}
      </PillText>
    </Pressable>
  );
}
