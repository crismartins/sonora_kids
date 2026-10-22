import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { BottomSheet } from "@/components/AppModal";
import { Button } from "@/components/Button";
import { CustomPhrase } from "@/services/customPhrases";

interface PhraseActionsModalProps {
  phrase: CustomPhrase | null;
  onClose: () => void;
  onEdit: (phrase: CustomPhrase) => void;
  onDelete: (phrase: CustomPhrase) => Promise<void>;
}

export function PhraseActionsModal({ phrase, onClose, onEdit, onDelete }: PhraseActionsModalProps) {
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
    <BottomSheet visible={!!phrase} title={label} closeLabel="Fechar opções" onClose={onClose}>
          {confirming ? (
            <View className="gap-3">
              <Text className="text-center font-quicksand text-xl text-neutral-dark">
                Excluir esta frase? Ela sai do aparelho.
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
                accessibilityLabel="Editar frase"
                onPress={() => phrase && onEdit(phrase)}
              />
              <Button
                label="Excluir"
                icon="trash"
                variant="dangerSoft"
                accessibilityLabel="Excluir frase"
                onPress={() => setConfirming(true)}
              />
              <Button label="Cancelar" variant="muted" onPress={onClose} />
            </View>
          )}
    </BottomSheet>
  );
}
