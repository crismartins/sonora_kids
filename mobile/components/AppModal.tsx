import type { ReactNode } from "react";
import { Platform, Pressable, View, Text, Modal, KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "@/components/Button";

const SCRIM = "rgba(0,0,0,0.4)";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  closeLabel?: string;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, title, closeLabel = "Fechar", children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel={closeLabel}
          onPress={onClose}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: SCRIM }}
        />
        <View className="rounded-t-[28px] bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-neutral" />
          {title ? <Text className="mb-4 text-center font-quicksand text-3xl text-dark">{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

type ScreenModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  avoidKeyboard?: boolean;
  children: ReactNode;
};

export function ScreenModal({ visible, onClose, title, avoidKeyboard = false, children }: ScreenModalProps) {
  const insets = useSafeAreaInsets();
  const body = (
    <>
      <View className="flex-row items-center justify-between px-4 pb-3" style={{ paddingTop: insets.top + 12 }}>
        <IconButton variant="ghost" size="md" icon="close-circle" accessibilityLabel="Fechar" onPress={onClose} />
        <Text className="font-quicksand text-xl text-dark">{title}</Text>
        <View className="w-10" />
      </View>
      {children}
    </>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        <View className="flex-1 bg-white">{body}</View>
      )}
    </Modal>
  );
}
