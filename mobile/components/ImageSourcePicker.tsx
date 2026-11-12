import { Alert, Image, ImageSourcePropType, Linking, Platform, Pressable, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { IconButton } from "@/components/Button";
import { SolarIcon } from "@/components/SolarIcon";
import { colors } from "@/constants/colors";
import { useI18n } from "@/i18n";

type ImageSourcePickerProps = {
  accessibilityLabel: string;
  alertTitle: string;
  onPicked: (uri: string) => void;
  onError?: (message: string) => void;
  previewUri?: string | null;
  previewSource?: ImageSourcePropType | null;
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
  previewSource,
  onPreviewError,
  allowsEditing,
  aspect,
  className,
  iconSize = 32,
}: ImageSourcePickerProps) {
  const copy = useI18n();
  const options = pickerOptions(allowsEditing, aspect);
  const source = previewUri ? { uri: previewUri } : (previewSource ?? null);

  const pickFromGallery = async () => {
    try {
      const allowed = await ensureAccess(
        ImagePicker.requestMediaLibraryPermissionsAsync,
        copy.photo.galleryDenied,
        onError,
      );
      if (!allowed) return;
      const result = await ImagePicker.launchImageLibraryAsync(options);
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (uri) onPicked(uri);
    } catch {
      onError?.(copy.photo.galleryError);
    }
  };

  const takePhoto = async () => {
    try {
      const allowed = await ensureAccess(
        ImagePicker.requestCameraPermissionsAsync,
        copy.photo.cameraDenied,
        onError,
      );
      if (!allowed) return;
      const result = await ImagePicker.launchCameraAsync(options);
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (uri) onPicked(uri);
    } catch {
      onError?.(copy.photo.cameraError);
    }
  };

  const chooseSource = () => {
    Alert.alert(alertTitle, copy.photo.prompt, [
      { text: copy.photo.camera, onPress: takePhoto },
      { text: copy.photo.gallery, onPress: pickFromGallery },
      { text: copy.common.cancel, style: "cancel" },
    ]);
  };

  return (
    <View className="relative self-center" style={source ? { paddingRight: 16, paddingBottom: 0 } : undefined}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        onPress={chooseSource}
        className={`items-center justify-center overflow-hidden bg-primary-soft border-4 border-light ${className ? ` ${className}` : ""}`}
      >
        {source ? (
          <Image source={source} onError={onPreviewError} className="h-full w-full" />
        ) : (
          <SolarIcon name="camera" size={iconSize} color={colors.neutralDark} />
        )}
      </Pressable>
      {source ? (
        <View className="absolute bottom-0 right-0" pointerEvents="box-none">
          <IconButton
            icon="pen"
            accessibilityLabel={copy.photo.edit}
            variant="neutral"
            size="sm"
            iconSize={20}
            onPress={chooseSource}
          />
        </View>
      ) : null}
    </View>
  );
}
