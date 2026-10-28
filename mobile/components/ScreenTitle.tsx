import { Text } from "react-native";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";

const SCREEN_TITLE_SIZE = 22;

export function ScreenTitle({ children, className }: { children: string; className?: string }) {
  const { fontScale } = useAppSettings();

  return (
    <Text
      numberOfLines={1}
      className={`font-quicksand text-dark${className ? ` ${className}` : ""}`}
      style={{ fontFamily: FONT_FAMILY, fontSize: Math.round(SCREEN_TITLE_SIZE * fontScale) }}
    >
      {children}
    </Text>
  );
}
