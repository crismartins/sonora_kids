import { ImageSourcePropType, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";

const STORAGE_KEY = "sonora.profile";

export const AVATAR_V1 = require("../assets/images/avatar_default_v1.png");
export const AVATAR_V2 = require("../assets/images/avatar_default_v2.png");

export type AvatarChoice = "v1" | "v2" | "photo";

export interface ChildProfile {
  nickname: string;
  name: string;
  avatar: AvatarChoice;
  photoUri?: string;
}

export const DEFAULT_PROFILE: ChildProfile = {
  nickname: "Joãozinho",
  name: "João Roberto Pereira da Silva",
  avatar: "v1",
};

export function profileAvatarSource(profile: ChildProfile): ImageSourcePropType {
  if (profile.avatar === "photo" && profile.photoUri) return { uri: profile.photoUri };
  if (profile.avatar === "v2") return AVATAR_V2;
  return AVATAR_V1;
}

function isProfile(value: unknown): value is ChildProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as ChildProfile;
  const avatarOk = profile.avatar === "v1" || profile.avatar === "v2" || profile.avatar === "photo";
  return (
    typeof profile.nickname === "string" &&
    typeof profile.name === "string" &&
    avatarOk &&
    (profile.photoUri === undefined || typeof profile.photoUri === "string")
  );
}

export async function loadProfile(): Promise<ChildProfile> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  const parsed: unknown = JSON.parse(raw);
  if (!isProfile(parsed)) return DEFAULT_PROFILE;
  if (parsed.avatar === "photo" && !parsed.photoUri) return { ...parsed, avatar: "v1" };
  return parsed;
}

async function saveProfile(profile: ChildProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function profileDir() {
  const dir = new Directory(Paths.document, "profile");
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function extensionFromUri(uri: string) {
  const path = uri.split("?")[0] ?? "";
  const match = path.match(/\.([a-zA-Z0-9]{2,5})$/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === "jpeg") return "jpg";
  if (ext && ["jpg", "png", "webp", "gif", "heic"].includes(ext)) return ext;
  return "jpg";
}

function deleteStoredFile(uri?: string) {
  if (Platform.OS === "web" || !uri || uri.startsWith("data:") || uri.startsWith("http")) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // The previous photo may already be gone.
  }
}

async function persistWebImage(uri: string): Promise<string> {
  if (uri.startsWith("data:")) return uri;

  const scope = globalThis as {
    document?: {
      createElement: (tag: string) => {
        width: number;
        height: number;
        getContext: (kind: string) => {
          drawImage: (image: unknown, x: number, y: number, w: number, h: number) => void;
        } | null;
        toDataURL: (type: string, quality: number) => string;
      };
    };
    Image?: new () => {
      src: string;
      width: number;
      height: number;
      onload: (() => void) | null;
      onerror: (() => void) | null;
    };
  };

  if (scope.document && scope.Image) {
    const image = new scope.Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Não foi possível ler a foto."));
      image.src = uri;
    });
    const maxSize = 800;
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height, 1));
    const canvas = scope.document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.8);
    }
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function persistAvatar(sourceUri: string): Promise<string> {
  if (Platform.OS === "web") return persistWebImage(sourceUri);
  const destination = new File(profileDir(), `avatar-${Date.now()}.${extensionFromUri(sourceUri)}`);
  await new File(sourceUri).copy(destination, { overwrite: true });
  return destination.uri;
}

export async function commitProfile(
  current: ChildProfile,
  draft: {
    nickname: string;
    name: string;
    avatar: AvatarChoice;
    pendingPhotoUri?: string | null;
  },
): Promise<ChildProfile> {
  const nickname = draft.nickname.trim();
  const name = draft.name.trim();
  if (!nickname) throw new Error("Escreva o apelido.");
  if (!name) throw new Error("Escreva o nome.");

  if (draft.avatar !== "photo") {
    if (current.photoUri) deleteStoredFile(current.photoUri);
    const next: ChildProfile = { nickname, name, avatar: draft.avatar };
    await saveProfile(next);
    return next;
  }

  const source = draft.pendingPhotoUri || current.photoUri;
  if (!source) throw new Error("Escolha uma foto ou um dos avatares.");

  let photoUri = current.photoUri;
  if (!photoUri || source !== current.photoUri) {
    photoUri = await persistAvatar(source);
    if (current.photoUri && current.photoUri !== photoUri) deleteStoredFile(current.photoUri);
  }

  const next: ChildProfile = { nickname, name, avatar: "photo", photoUri };
  await saveProfile(next);
  return next;
}
