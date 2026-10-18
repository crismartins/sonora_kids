import React, { useEffect, useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { CustomPec } from "@/services/customPecs";

interface PecActionsModalProps {
  pec: CustomPec | null;
  onClose: () => void;
  onEdit: (pec: CustomPec) => void;
  onDelete: (pec: CustomPec) => Promise<void>;
}

export function PecActionsModal({ pec, onClose, onEdit, onDelete }: PecActionsModalProps) {
  const insets = useSafeAreaInsets();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setConfirming(false);
    setDeleting(false);
  }, [pec?.id]);

  const handleDelete = async () => {
    if (!pec || deleting) return;
    setDeleting(true);
    try {
      await onDelete(pec);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal visible={!!pec} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Fechar opções"
          onPress={onClose}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
        />
        <View className="rounded-t-[28px] bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-neutral" />
          <Text className="mb-4 text-center font-quicksand text-3xl text-dark">{pec?.title}</Text>
          {confirming ? (
            <View className="gap-3">
              <Text className="text-center font-quicksand text-xl text-neutral-dark">
                Excluir este PEC? Ele sai do aparelho.
              </Text>
              <Button
                label="Excluir"
                icon="trash"
                variant="danger"
                loading={deleting}
                accessibilityLabel="Confirmar exclusão"
                onPress={handleDelete}
              />
              <Button label="Voltar" variant="muted" onPress={() => setConfirming(false)} />
            </View>
          ) : (
            <View className="gap-3">
              <Button
                label="Editar"
                icon="pen"
                variant="soft"
                accessibilityLabel="Editar PEC"
                onPress={() => pec && onEdit(pec)}
              />
              <Button
                label="Excluir"
                icon="trash"
                variant="dangerSoft"
                accessibilityLabel="Excluir PEC"
                onPress={() => setConfirming(true)}
              />
              <Button label="Cancelar" variant="muted" onPress={onClose} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
