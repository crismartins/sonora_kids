import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { SolarIcon, SolarIconName } from "@/components/SolarIcon";
import { colors } from "@/constants/colors";

export function EmptyState({
  icon,
  title,
  detail,
  actionLabel,
  onAction,
}: {
  icon: SolarIconName;
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10">
      <SolarIcon name={icon} size={48} color={colors.neutralDark} />
      <Text className="text-center font-quicksand text-2xl text-dark">{title}</Text>
      {detail ? <Text className="text-center font-quicksand text-lg text-neutral-dark">{detail}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} size="md" className="mt-2 px-6" onPress={onAction} />
      ) : null}
    </View>
  );
}

export function FormError({ message, className }: { message?: string | null; className?: string }) {
  if (!message) return null;
  return (
    <Text className={`text-center font-quicksand text-lg text-danger${className ? ` ${className}` : ""}`}>
      {message}
    </Text>
  );
}
