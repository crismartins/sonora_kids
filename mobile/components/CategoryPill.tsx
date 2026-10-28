import { LayoutChangeEvent, Pressable, View } from "react-native";
import { CategoryIcon } from "@/components/CategoryIcon";
import { PillText } from "@/components/PillText";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";

const SIZE = {
  md: { pill: 44, icon: 28, label: 14, pad: 10, gap: 6 },
  lg: { pill: 52, icon: 33, label: 16, pad: 12, gap: 8 },
} as const;

export function CategoryPill({
  slug,
  name,
  colorName,
  selected,
  highContrast,
  size = "md",
  onPress,
  onLayout,
}: {
  slug: string;
  name: string;
  colorName: string;
  selected: boolean;
  highContrast: boolean;
  size?: keyof typeof SIZE;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const scale = SIZE[size];
  const color = getCategoryColor(colorName);
  const labelColor = highContrast ? colors.white : color;

  return (
    <Pressable
      accessibilityLabel={name}
      accessibilityState={{ selected }}
      onPress={onPress}
      onLayout={onLayout}
      className="flex-row items-center justify-center rounded-full"
      style={{
        backgroundColor: highContrast ? color : getCategoryBgColor(colorName),
        height: scale.pill,
        width: selected ? undefined : scale.pill,
        paddingHorizontal: selected ? scale.pad : 0,
        gap: selected ? scale.gap : 0,
      }}
    >
      <View
        className="items-center justify-center rounded-full bg-white/60"
        style={{ width: scale.icon, height: scale.icon }}
      >
        {categoryIconBySlug[slug] ? (
          <CategoryIcon slug={slug} size={scale.icon} />
        ) : (
          <PillText size={scale.label} style={{ color: labelColor }}>
            {name.slice(0, 1)}
          </PillText>
        )}
      </View>
      {selected ? (
        <PillText size={scale.label} style={{ color: labelColor, letterSpacing: 0.4 }}>
          {name.toUpperCase()}
        </PillText>
      ) : null}
    </Pressable>
  );
}
