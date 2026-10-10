import React, { useEffect, useState } from "react";
import { View, Text, Modal, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CustomPhrase } from "@/services/customPhrases";
import { colors } from "@/constants/colors";

interface PhraseActionsModalProps {
  phrase: CustomPhrase | null;
  onClose: () => void;
  onEdit: (phrase: CustomPhrase) => void;
  onDelete: (phrase: CustomPhrase) => Promise<void>;
}

export function PhraseActionsModal({ phrase, onClose, onEdit, onDelete }: PhraseActionsModalProps) {
  const insets = useSafeAreaInsets();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const label = phrase?.items.map((item) => item.text).join(" ");

  useEffect(() => {
    setConfirming(false);
    setDeleting(false);
  }, [phrase?.id]);

  const handleDelete = async () => {
    if (!phrase || deleting) return;
    setDeleting(true);
    try {
      await onDelete(phrase);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal visible={!!phrase} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Fechar opções"
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
        <View
          className="rounded-t-[28px] bg-white px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-[#E4F4FF]" />
          <Text className="mb-4 text-center font-dongle-bold text-3xl text-dark">{label}</Text>
          {confirming ? (
            <View className="gap-3">
              <Text className="text-center font-dongle text-xl text-neutral-dark">
                Excluir esta frase? Ela sai do aparelho.
              </Text>
              <Pressable
                accessibilityLabel="Confirmar exclusão"
                onPress={handleDelete}
                disabled={deleting}
                className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-[#D32F2F]"
                style={{ opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text className="font-dongle-bold text-2xl text-white">Excluir</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                accessibilityLabel="Voltar"
                onPress={() => setConfirming(false)}
                className="h-14 items-center justify-center rounded-full bg-[#F5F5F5]"
              >
                <Text className="font-dongle-bold text-2xl text-dark">Voltar</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-3">
              <Pressable
                accessibilityLabel="Editar frase"
                onPress={() => phrase && onEdit(phrase)}
                className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-[#F0F8FF]"
              >
                <Ionicons name="pencil" size={20} color={colors.primary} />
                <Text className="font-dongle-bold text-2xl text-primary">Editar</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Excluir frase"
                onPress={() => setConfirming(true)}
                className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-[#FDECEC]"
              >
                <Ionicons name="trash" size={20} color="#D32F2F" />
                <Text className="font-dongle-bold text-2xl text-[#D32F2F]">Excluir</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Cancelar"
                onPress={onClose}
                className="h-14 items-center justify-center rounded-full bg-[#F5F5F5]"
              >
                <Text className="font-dongle-bold text-2xl text-dark">Cancelar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
