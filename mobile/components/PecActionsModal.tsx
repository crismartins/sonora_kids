import React, { useEffect, useState } from "react";
import { BottomSheet } from "@/components/AppModal";
import { ManageActions } from "@/components/ManageActions";
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
      <ManageActions
        confirming={confirming}
        message="Excluir este PEC? Ele sai do aparelho."
        deleting={deleting}
        editLabel="Editar PEC"
        onEdit={() => pec && onEdit(pec)}
        onAskDelete={() => setConfirming(true)}
        onConfirmDelete={handleDelete}
        onCancelConfirm={() => setConfirming(false)}
        onClose={onClose}
      />
    </BottomSheet>
  );
}
