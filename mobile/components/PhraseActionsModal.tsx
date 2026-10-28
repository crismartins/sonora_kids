import React, { useEffect, useState } from "react";
import { BottomSheet } from "@/components/AppModal";
import { ManageActions } from "@/components/ManageActions";
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
      <ManageActions
        confirming={confirming}
        message="Excluir esta frase? Ela sai do aparelho."
        deleting={deleting}
        editLabel="Editar frase"
        onEdit={() => phrase && onEdit(phrase)}
        onAskDelete={() => setConfirming(true)}
        onConfirmDelete={handleDelete}
        onCancelConfirm={() => setConfirming(false)}
        onClose={onClose}
      />
    </BottomSheet>
  );
}
