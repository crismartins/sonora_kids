import { Text, View } from "react-native";
import { Button } from "@/components/Button";

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
  if (confirming) {
    return (
      <View className="gap-3">
        <Text className="text-center font-quicksand text-xl text-neutral-dark">{message}</Text>
        <Button
          label="Excluir"
          icon="trash"
          variant="danger"
          loading={deleting}
          accessibilityLabel="Confirmar exclusão"
          onPress={onConfirmDelete}
        />
        <Button label="Voltar" variant="muted" onPress={onCancelConfirm} />
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Button label="Editar" icon="pen" variant="soft" accessibilityLabel={editLabel} onPress={onEdit} />
      <Button label="Excluir" icon="trash" variant="dangerSoft" accessibilityLabel="Excluir" onPress={onAskDelete} />
      <Button label="Cancelar" variant="muted" onPress={onClose} />
    </View>
  );
}
