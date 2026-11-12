import React, { useEffect, useState } from "react";
import { BottomSheet } from "@/components/AppModal";
import { ManageActions } from "@/components/ManageActions";
import { useProfile } from "@/context/ProfileContext";
import { pecPhrase } from "@/data/pecLabels";
import { useI18n } from "@/i18n";
import { CustomPhrase } from "@/services/customPhrases";

interface PhraseActionsModalProps {
  phrase: CustomPhrase | null;
  onClose: () => void;
  onEdit: (phrase: CustomPhrase) => void;
  onDelete: (phrase: CustomPhrase) => Promise<void>;
}

export function PhraseActionsModal({ phrase, onClose, onEdit, onDelete }: PhraseActionsModalProps) {
  const { profile } = useProfile();
  const copy = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const label = phrase ? pecPhrase(phrase.items.map((item) => item.text), profile.sex) : undefined;

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
    <BottomSheet visible={!!phrase} title={label} closeLabel={copy.phrases.closeOptions} onClose={onClose}>
      <ManageActions
        confirming={confirming}
        message={copy.phrases.deletePhrase}
        deleting={deleting}
        editLabel={copy.phrases.editPhrase}
        onEdit={() => phrase && onEdit(phrase)}
        onAskDelete={() => setConfirming(true)}
        onConfirmDelete={handleDelete}
        onCancelConfirm={() => setConfirming(false)}
        onClose={onClose}
      />
    </BottomSheet>
  );
}
