import React from "react";
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TextProps,
  TextInputProps,
  TextStyle,
  StyleProp,
} from "react-native";
import { cssInterop } from "nativewind";
import { useAppSettings } from "@/context/AppSettingsContext";
import { FONT_FAMILY } from "@/constants/typography";

const InteropText = cssInterop(RNText, { className: "style" });
const InteropTextInput = cssInterop(RNTextInput, { className: "style" });

/** Tailwind sizes in px, matching what NativeWind paints for these utilities. */
const TEXT_UTILITIES: Record<string, [number, number]> = {
  "text-xs": [12, 16],
  "text-sm": [14, 20],
  "text-base": [16, 24],
  "text-lg": [18, 28],
  "text-xl": [20, 28],
  "text-2xl": [24, 32],
  "text-3xl": [30, 36],
  "text-4xl": [36, 40],
  "text-5xl": [48, 48],
};

const LEADING_UTILITIES: Record<string, number> = {
  "leading-3": 12,
  "leading-4": 16,
  "leading-5": 20,
  "leading-6": 24,
  "leading-7": 28,
  "leading-8": 32,
  "leading-9": 36,
  "leading-10": 40,
};

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

type TextMetrics = {
  fontSize?: number;
  lineHeight?: number;
};

function scaleStyle(style: StyleProp<TextStyle> | undefined, scale: number) {
  if (scale === 1 || style == null) return style;
  const flat = StyleSheet.flatten(style);
  if (!flat) return style;
  const patch: TextMetrics = {};
  const fontSize = asNumber(flat.fontSize);
  const lineHeight = asNumber(flat.lineHeight);
  if (fontSize != null) patch.fontSize = Math.round(fontSize * scale);
  if (lineHeight != null) patch.lineHeight = Math.round(lineHeight * scale);
  return Object.keys(patch).length > 0 ? [style, patch] : style;
}

function scaleClassName(className: string | undefined, scale: number) {
  if (!className || scale === 1) return { className, fontStyle: undefined as TextMetrics | undefined };
  const fontStyle: TextMetrics = {};
  const kept: string[] = [];
  for (const token of className.split(/\s+/)) {
    if (!token) continue;
    const named = TEXT_UTILITIES[token];
    if (named) {
      fontStyle.fontSize = Math.round(named[0] * scale);
      fontStyle.lineHeight = Math.round(named[1] * scale);
      continue;
    }
    const arbitrarySize = token.match(/^text-\[(\d+(?:\.\d+)?)px\]$/);
    if (arbitrarySize) {
      fontStyle.fontSize = Math.round(Number(arbitrarySize[1]) * scale);
      continue;
    }
    const namedLeading = LEADING_UTILITIES[token];
    if (namedLeading) {
      fontStyle.lineHeight = Math.round(namedLeading * scale);
      continue;
    }
    const arbitraryLeading = token.match(/^leading-\[(\d+(?:\.\d+)?)px\]$/);
    if (arbitraryLeading) {
      fontStyle.lineHeight = Math.round(Number(arbitraryLeading[1]) * scale);
      continue;
    }
    kept.push(token);
  }
  return {
    className: kept.join(" "),
    fontStyle: fontStyle.fontSize || fontStyle.lineHeight ? fontStyle : undefined,
  };
}

type ScaledProps = { className?: string; style?: StyleProp<TextStyle> };

function useScaledTypography({ className, style }: ScaledProps) {
  const { fontScale } = useAppSettings();
  const scaled = scaleClassName(className, fontScale);
  return {
    className: scaled.className,
    style: [scaleStyle(style, fontScale), scaled.fontStyle],
  };
}

const appFont: TextStyle = {
  fontFamily: FONT_FAMILY,
};

function ScaledTextBase({ className, style, ...props }: TextProps & { className?: string }) {
  const typography = useScaledTypography({ className, style });
  return (
    <InteropText
      {...props}
      className={typography.className}
      style={[appFont, typography.style]}
    />
  );
}

function ScaledTextInputBase({
  className,
  style,
  ...props
}: TextInputProps & { className?: string }) {
  const typography = useScaledTypography({ className, style });
  return (
    <InteropTextInput
      {...props}
      className={typography.className}
      style={[appFont, typography.style]}
    />
  );
}

export const ScaledText = ScaledTextBase;
export const ScaledTextInput = ScaledTextInputBase;
