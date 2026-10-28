import React, { useState } from "react";
import { Alert, View, Text, TextInput, Pressable, ScrollView, Image, Platform, Linking, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton } from "@/components/Button";
import { FormError } from "@/components/ScreenState";
import { SolarIcon } from "@/components/SolarIcon";
import * as ImagePicker from "expo-image-picker";
import { Category } from "@/types";
import { colors } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { useAppSettings } from "@/context/AppSettingsContext";
import { CustomPec, NewCustomPec } from "@/services/customPecs";

export type PecFormRequest = {
  categories: Category[];
  initialCategorySlug: string;
  initialPec?: CustomPec | null;
  onSubmit: (input: NewCustomPec) => Promise<void>;
  onClose?: () => void;
};

let request: PecFormRequest | null = null;
let open = false;

export function openPecForm(next: PecFormRequest) {
  if (open) return;
  open = true;
  request = next;
  router.push("/pec");
}

export function currentPecForm() {
  return request;
}

export function finishPecForm() {
  const closing = request;
  request = null;
  open = false;
  closing?.onClose?.();
}

interface AddPecFormProps {
  categories: Category[];
  initialCategorySlug: string;
  initialPec?: CustomPec | null;
  onClose: () => void;
  onSubmit: (input: NewCustomPec) => Promise<void>;
}

function existingImage(pec?: CustomPec | null) {
  return pec?.localUri || pec?.imageUrl || "";
}

export function AddPecForm({ categories, initialCategorySlug, initialPec, onClose, onSubmit }: AddPecFormProps) {
  const insets = useSafeAreaInsets();
  const { speak } = useAppSettings();
  const [title, setTitle] = useState(initialPec?.title ?? "");
  const [categorySlug, setCategorySlug] = useState(initialPec?.categorySlug ?? initialCategorySlug);
  const [localUri, setLocalUri] = useState<string | null>(existingImage(initialPec) || null);
  const [imageChanged, setImageChanged] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const previewUri = localUri && !previewFailed ? localUri : null;
  const name = title.trim();
  const canHear = name.length > 0;
  const canSave = canHear && !!categorySlug && !!previewUri && !saving;

  const handleSave = async () => {
    const name = title.trim();
    if (!name) {
      setError("Escreva o nome do PEC.");
      return;
    }
    if (!categorySlug) {
      setError("Escolha uma categoria.");
      return;
    }
    const keepingImage = !!initialPec && !imageChanged;
    if (!keepingImage && !localUri) {
      setError("Escolha uma foto do dispositivo ou tire uma foto.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(
        keepingImage
          ? { title: name, categorySlug, keepImage: true }
          : {
              title: name,
              categorySlug,
              localUri: localUri ?? undefined,
            },
      );
      onClose();
    } catch {
      setError("Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  };

  const usePickedImage = (uri: string) => {
    setLocalUri(uri);
    setImageChanged(true);
    setPreviewFailed(false);
    setError(null);
  };

  const pickFromDevice = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setError("Permita o acesso às fotos para escolher uma imagem.");
          if (!permission.canAskAgain) {
            Linking.openSettings().catch(() => undefined);
          }
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (!uri) return;
      usePickedImage(uri);
    } catch {
      setError("Não foi possível abrir as fotos do dispositivo.");
    }
  };

  const choosePhotoSource = () => {
    Alert.alert("Foto do PEC", "Tire uma foto ou escolha uma da galeria.", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromDevice },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError("Permita o uso da câmera para tirar a foto.");
          if (!permission.canAskAgain) {
            Linking.openSettings().catch(() => undefined);
          }
          return;
        }
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (!uri) return;
      usePickedImage(uri);
    } catch {
      setError("Não foi possível abrir a câmera.");
    }
  };

  const hearTitle = () => {
    const name = title.trim();
    if (!name) return;
    speak(name);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 16 }}
      >
        <Pressable
          accessibilityLabel="Adicionar foto do PEC"
          onPress={choosePhotoSource}
          className="h-24 w-24 self-center items-center justify-center overflow-hidden rounded-3xl bg-primary-soft"
        >
          {previewUri ? (
            <Image source={{ uri: previewUri }} onError={() => setPreviewFailed(true)} className="h-full w-full" />
          ) : (
            <SolarIcon name="camera" size={36} color={colors.neutralDark} />
          )}
        </Pressable>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Nome do PEC"
          placeholderTextColor={colors.neutralDark}
          accessibilityLabel="Nome do PEC"
          className="rounded-3xl border border-neutral bg-neutral-light px-4 font-quicksand text-xl text-dark"
          style={{ fontFamily: FONT_FAMILY, fontSize: 20, height: 64 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="flex-row gap-2">
            {categories.map((category) => {
              const selected = category.slug === categorySlug;
              const icon = categoryIconBySlug[category.slug];
              return (
                <Pressable
                  key={category.slug}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setCategorySlug(category.slug);
                    if (category.name) speak(category.name);
                  }}
                  className={`h-16 flex-row items-center gap-2 rounded-2xl bg-primary-soft px-3 ${
                    selected ? "border-2 border-primary" : "border-2 border-transparent"
                  }`}
                >
                  {icon ? (
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                      <CategoryIcon slug={category.slug} size={28} />
                    </View>
                  ) : null}
                  <Text className="font-quicksand text-lg text-dark">{category.name.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <IconButton
          icon="volume"
          accessibilityLabel="Ouvir o nome do PEC"
          variant="primary"
          size="lg"
          iconSize={28}
          disabled={!canHear}
          className="self-center"
          onPress={hearTitle}
        />

        <FormError message={previewFailed ? "Não consegui abrir essa imagem. Escolha outra foto." : null} />
        <FormError message={error} />
      </ScrollView>

      <View className="flex-row gap-3 px-5 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          label="Sair"
          icon="close-circle"
          variant="soft"
          shape="rounded"
          size="md"
          disabled={saving}
          className="flex-1"
          onPress={onClose}
        />
        <Button
          label="Salvar"
          icon="check-circle"
          shape="rounded"
          size="md"
          loading={saving}
          disabled={!canSave}
          className="flex-1"
          onPress={handleSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
