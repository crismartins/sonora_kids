import React, { useEffect, useState } from "react";
import { BottomSheet } from "@/components/AppModal";
import { ManageActions } from "@/components/ManageActions";
import { useI18n } from "@/i18n";
import { CustomPec } from "@/services/customPecs";

interface PecActionsModalProps {
  pec: CustomPec | null;
  onClose: () => void;
  onEdit: (pec: CustomPec) => void;
  onDelete: (pec: CustomPec) => Promise<void>;
}

export function PecActionsModal({ pec, onClose, onEdit, onDelete }: PecActionsModalProps) {
  const copy = useI18n();
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
    <BottomSheet visible={!!pec} title={pec?.title} closeLabel={copy.pec.closeOptions} onClose={onClose}>
      <ManageActions
        confirming={confirming}
        message={copy.pec.deleteAsk}
        deleting={deleting}
        editLabel={copy.pec.edit}
        onEdit={() => pec && onEdit(pec)}
        onAskDelete={() => setConfirming(true)}
        onConfirmDelete={handleDelete}
        onCancelConfirm={() => setConfirming(false)}
        onClose={onClose}
      />
    </BottomSheet>
  );
}
