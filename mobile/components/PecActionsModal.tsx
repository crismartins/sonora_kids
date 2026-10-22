import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { BottomSheet } from "@/components/AppModal";
import { Button } from "@/components/Button";
import { CustomPec } from "@/services/customPecs";

interface PecActionsModalProps {
  pec: CustomPec | null;
  onClose: () => void;
  onEdit: (pec: CustomPec) => void;
  onDelete: (pec: CustomPec) => Promise<void>;
}

export function PecActionsModal({ pec, onClose, onEdit, onDelete }: PecActionsModalProps) {
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
    <BottomSheet visible={!!pec} title={pec?.title} closeLabel="Fechar opções" onClose={onClose}>
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
    </BottomSheet>
  );
}
