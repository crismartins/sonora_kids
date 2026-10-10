import React from "react";
import { Text, TextProps, TextStyle } from "react-native";

type PillTextProps = TextProps & {
  className?: string;
  /** Font size in px. Caps are shifted onto the pill's vertical center. */
  size?: number;
};

/**
 * Dongle draws its letters above the line-box center (the descender area is empty).
 * Shift the label down so the ink sits on the pill axis, on iOS, Android, and web.
 * The app-wide font setting scales this text together with every other label.
 */
export function PillText({ size = 16, style, ...props }: PillTextProps) {
  const textStyle: TextStyle = {
    fontFamily: "Dongle-Bold",
    fontSize: size,
    lineHeight: Math.round(size * 1.5),
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    transform: [{ translateY: size * 0.08 }],
  };

  return <Text style={[textStyle, style]} {...props} />;
}
