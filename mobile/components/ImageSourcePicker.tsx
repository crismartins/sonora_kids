import { Alert, Image, Linking, Platform, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SolarIcon } from "@/components/SolarIcon";
import { colors } from "@/constants/colors";

type ImageSourcePickerProps = {
  accessibilityLabel: string;
  alertTitle: string;
  onPicked: (uri: string) => void;
  onError?: (message: string) => void;
  previewUri?: string | null;
  onPreviewError?: () => void;
  allowsEditing?: boolean;
  aspect?: [number, number];
  className?: string;
  iconSize?: number;
};

function pickerOptions(allowsEditing?: boolean, aspect?: [number, number]): ImagePicker.ImagePickerOptions {
  return {
    mediaTypes: ["images"],
    quality: 0.7,
    ...(allowsEditing ? { allowsEditing: true, aspect } : {}),
  };
}

async function ensureAccess(
  request: () => Promise<ImagePicker.PermissionResponse>,
  deniedMessage: string,
  onError?: (message: string) => void,
) {
  if (Platform.OS === "web") return true;
  const permission = await request();
  if (permission.granted) return true;
  onError?.(deniedMessage);
  if (!permission.canAskAgain) Linking.openSettings().catch(() => undefined);
  return false;
}

export function ImageSourcePicker({
  accessibilityLabel,
  alertTitle,
  onPicked,
  onError,
  previewUri,
  onPreviewError,
  allowsEditing,
  aspect,
  className,
  iconSize = 32,
}: ImageSourcePickerProps) {
  const options = pickerOptions(allowsEditing, aspect);

  const pickFromGallery = async () => {
    try {
      const allowed = await ensureAccess(
        ImagePicker.requestMediaLibraryPermissionsAsync,
        "Permita o acesso às fotos para escolher uma imagem.",
        onError,
      );
      if (!allowed) return;
      const result = await ImagePicker.launchImageLibraryAsync(options);
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (uri) onPicked(uri);
    } catch {
      onError?.("Não foi possível abrir a galeria.");
    }
  };

  const takePhoto = async () => {
    try {
      const allowed = await ensureAccess(
        ImagePicker.requestCameraPermissionsAsync,
        "Permita o uso da câmera para tirar a foto.",
        onError,
      );
      if (!allowed) return;
      const result = await ImagePicker.launchCameraAsync(options);
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (uri) onPicked(uri);
    } catch {
      onError?.("Não foi possível abrir a câmera.");
    }
  };

  const chooseSource = () => {
    Alert.alert(alertTitle, "Tire uma foto ou escolha uma da galeria.", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={chooseSource}
      className={`items-center justify-center overflow-hidden bg-primary-soft border-4 border-light ${className ? ` ${className}` : ""}`}
    >
      {previewUri ? (
        <Image source={{ uri: previewUri }} onError={onPreviewError} className="h-full w-full" />
      ) : (
        <SolarIcon name="camera" size={iconSize} color={colors.neutralDark} />
      )}
    </Pressable>
  );
}
