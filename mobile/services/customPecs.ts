import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import { PecItem } from "@/types";

const STORAGE_KEY = "sonora.customPecs";

export interface CustomPec {
  id: string;
  title: string;
  categorySlug: string;
  imageUrl: string;
  localUri?: string;
}

export interface NewCustomPec {
  title: string;
  categorySlug: string;
  imageUrl?: string;
  localUri?: string;
  keepImage?: boolean;
}

function isCustomPec(value: unknown): value is CustomPec {
  if (!value || typeof value !== "object") return false;
  const pec = value as CustomPec;
  return (
    typeof pec.id === "string" &&
    typeof pec.title === "string" &&
    typeof pec.categorySlug === "string" &&
    typeof pec.imageUrl === "string"
  );
}

export async function loadCustomPecs(): Promise<CustomPec[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isCustomPec);
}

export async function saveCustomPecs(pecs: CustomPec[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pecs));
}

function customPecsDir() {
  const dir = new Directory(Paths.document, "custom-pecs");
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
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

async function cacheImage(id: string, imageUrl: string): Promise<string | undefined> {
  if (Platform.OS === "web") return undefined;
  const destination = new File(customPecsDir(), `${id}.img`);
  const file = await File.downloadFileAsync(imageUrl, destination, { idempotent: true });
  return file.uri;
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
      image.onerror = () => reject(new Error("Não foi possível ler a imagem."));
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

async function persistPickedImage(id: string, sourceUri: string): Promise<string> {
  if (Platform.OS === "web") return persistWebImage(sourceUri);
  const destination = new File(customPecsDir(), `${id}.${extensionFromUri(sourceUri)}`);
  await new File(sourceUri).copy(destination, { overwrite: true });
  return destination.uri;
}

function deleteStoredFile(uri?: string) {
  if (Platform.OS === "web" || !uri || uri.startsWith("data:") || uri.startsWith("http")) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // The picture may already be gone.
  }
}

async function storeImage(
  id: string,
  input: NewCustomPec,
): Promise<{ imageUrl: string; localUri?: string }> {
  const imageUrl = input.imageUrl?.trim() ?? "";
  const pickedUri = input.localUri?.trim();
  if (pickedUri) {
    const storedUri = await persistPickedImage(id, pickedUri);
    return {
      imageUrl: storedUri.startsWith("data:") ? "" : imageUrl,
      localUri: storedUri,
    };
  }
  let localUri: string | undefined;
  try {
    localUri = imageUrl ? await cacheImage(id, imageUrl) : undefined;
  } catch {
    localUri = undefined;
  }
  return { imageUrl, localUri };
}

export async function createCustomPec(input: NewCustomPec): Promise<CustomPec> {
  const id = `custom-${Date.now()}`;
  const image = await storeImage(id, input);
  return {
    id,
    title: input.title.trim(),
    categorySlug: input.categorySlug,
    ...image,
  };
}

export async function updateCustomPec(current: CustomPec, input: NewCustomPec): Promise<CustomPec> {
  const title = input.title.trim();
  if (input.keepImage) {
    return { ...current, title, categorySlug: input.categorySlug };
  }
  deleteStoredFile(current.localUri);
  const image = await storeImage(current.id, input);
  return {
    ...current,
    title,
    categorySlug: input.categorySlug,
    ...image,
  };
}

export async function deleteCustomPecImage(pec: CustomPec): Promise<void> {
  deleteStoredFile(pec.localUri);
}

export function customPecToItem(pec: CustomPec): PecItem {
  return {
    id: pec.id,
    title: pec.title,
    featuredImage: {
      node: { sourceUrl: pec.localUri || pec.imageUrl },
    },
  };
}
