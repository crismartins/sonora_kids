import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";
import { SolarIcon, SolarIconName } from "@/components/SolarIcon";
import { colors } from "@/constants/colors";

const ELEVATION: ViewStyle = {
  shadowColor: colors.dark,
  shadowOpacity: 0.22,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

type ButtonVariant = "primary" | "neutral" | "muted" | "soft" | "danger" | "dangerSoft" | "ghost";
type ButtonSize = "md" | "lg";
type ButtonShape = "pill" | "rounded";

const VARIANT: Record<ButtonVariant, { box: string; label: string; icon: string }> = {
  primary: { box: "bg-primary active:opacity-90", label: "text-white", icon: colors.white },
  neutral: { box: "bg-neutral active:opacity-80", label: "text-primary", icon: colors.primary },
  muted: { box: "bg-muted", label: "text-dark", icon: colors.dark },
  soft: { box: "bg-primary-soft", label: "text-primary", icon: colors.primary },
  danger: { box: "bg-danger", label: "text-white", icon: colors.white },
  dangerSoft: { box: "bg-danger-soft", label: "text-danger", icon: colors.danger },
  ghost: { box: "active:opacity-70", label: "text-primary", icon: colors.primary },
};

const SIZE: Record<ButtonSize, { box: string; label: string; icon: number }> = {
  md: { box: "h-16 px-4", label: "text-lg", icon: 18 },
  lg: { box: "h-20 px-4", label: "text-xl", icon: 20 },
};

const SHAPE: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-2xl",
};

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  labelSize?: ButtonSize;
  shape?: ButtonShape;
  icon?: SolarIconName;
  iconSize?: number;
  loading?: boolean;
  disabled?: boolean;
  elevated?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  labelSize,
  shape = "rounded",
  icon,
  iconSize,
  loading = false,
  disabled = false,
  elevated = false,
  accessibilityLabel,
  className,
}: ButtonProps) {
  const tone = VARIANT[variant];
  const scale = SIZE[size];
  const text = SIZE[labelSize ?? size].label;
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      className={`flex-row items-center justify-center gap-2 ${SHAPE[shape]} ${scale.box} ${tone.box}${className ? ` ${className}` : ""}`}
      style={[elevated ? ELEVATION : undefined, { opacity: inactive ? 0.7 : 1 }]}
    >
      {loading ? (
        <ActivityIndicator color={tone.icon} />
      ) : (
        <>
          {icon ? <SolarIcon name={icon} size={iconSize ?? scale.icon} color={tone.icon} /> : null}
          <Text className={`font-quicksand ${text} ${tone.label}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

type IconButtonVariant = "muted" | "primary" | "neutral" | "ghost";
type IconButtonSize = "sm" | "md";

const ICON_VARIANT: Record<IconButtonVariant, { box: string; icon: string }> = {
  muted: { box: "bg-muted", icon: colors.dark },
  primary: { box: "bg-primary active:opacity-90", icon: colors.white },
  neutral: { box: "bg-neutral active:opacity-80", icon: colors.primary },
  ghost: { box: "bg-transparent", icon: colors.neutralDark },
};

const ICON_SIZE: Record<IconButtonSize, { box: string; icon: number }> = {
  sm: { box: "h-10 w-10", icon: 22 },
  md: { box: "h-12 w-12", icon: 26 },
};

type IconButtonProps = {
  icon: SolarIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  iconSize?: number;
  disabled?: boolean;
  className?: string;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = "muted",
  size = "sm",
  iconSize,
  disabled = false,
  className,
}: IconButtonProps) {
  const tone = ICON_VARIANT[variant];
  const scale = ICON_SIZE[size];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      className={`items-center justify-center rounded-full ${scale.box} ${tone.box}${className ? ` ${className}` : ""}`}
      style={{ opacity: disabled ? 0.35 : 1 }}
    >
      <SolarIcon name={icon} size={iconSize ?? scale.icon} color={tone.icon} />
    </Pressable>
  );
}

type FloatingButtonProps = {
  icon: SolarIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  iconSize?: number;
  bottom?: number;
  className?: string;
};

export function FloatingButton({
  icon,
  accessibilityLabel,
  onPress,
  iconSize = 32,
  bottom,
  className,
}: FloatingButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={`h-16 w-16 items-center justify-center rounded-full bg-primary${bottom != null ? " absolute right-5" : ""}${className ? ` ${className}` : ""}`}
      style={[ELEVATION, bottom != null ? { bottom } : undefined]}
    >
      <SolarIcon name={icon} size={iconSize} color={colors.white} />
    </Pressable>
  );
}
