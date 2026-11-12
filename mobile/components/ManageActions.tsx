import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { useI18n } from "@/i18n";

export function ManageActions({
  confirming,
  message,
  deleting,
  editLabel,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelConfirm,
  onClose,
}: {
  confirming: boolean;
  message: string;
  deleting: boolean;
  editLabel: string;
  onEdit: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelConfirm: () => void;
  onClose: () => void;
}) {
  const copy = useI18n();
  if (confirming) {
    return (
      <View className="gap-3">
        <Text className="text-center font-quicksand text-xl text-neutral-dark">{message}</Text>
        <Button
          label={copy.common.delete}
          icon="trash"
          variant="danger"
          loading={deleting}
          accessibilityLabel={copy.pec.confirmDelete}
          onPress={onConfirmDelete}
        />
        <Button label={copy.common.back} variant="muted" onPress={onCancelConfirm} />
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Button label={copy.common.edit} icon="pen" variant="soft" accessibilityLabel={editLabel} onPress={onEdit} />
      <Button label={copy.common.delete} icon="trash" variant="dangerSoft" accessibilityLabel={copy.common.delete} onPress={onAskDelete} />
      <Button label={copy.common.cancel} variant="muted" onPress={onClose} />
    </View>
  );
}
