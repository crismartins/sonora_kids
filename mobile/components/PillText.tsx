import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { FONT_FAMILY } from "@/constants/typography";

type PillTextProps = TextProps & {
  className?: string;
  /** Font size in px. */
  size?: number;
};

/** Pill label. The parent centers it; the font uses its own line metrics. */
export function PillText({ size = 16, style, ...props }: PillTextProps) {
  const textStyle: TextStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: size,
    textAlign: "center",
  };

  return <Text style={[textStyle, style]} {...props} />;
}
