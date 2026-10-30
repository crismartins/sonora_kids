import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton } from "@/components/Button";
import { FormError } from "@/components/ScreenState";
import { ImageSourcePicker } from "@/components/ImageSourcePicker";
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

function pecSaveReason(name: string, categorySlug: string, previewUri: string | null) {
  if (!name) return "Escreva o nome";
  if (!categorySlug) return "Escolha uma categoria";
  if (!previewUri) return "Escolha uma foto";
  return undefined;
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

  const hearTitle = () => {
    const name = title.trim();
    if (!name) return;
    speak(name);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 20, paddingBottom: 24, gap: 16 }}
      >
        <ImageSourcePicker
          accessibilityLabel="Adicionar foto do PEC"
          alertTitle="Foto do PEC"
          previewUri={previewUri}
          onPreviewError={() => setPreviewFailed(true)}
          className="h-24 w-24 self-center rounded-3xl"
          iconSize={36}
          onPicked={usePickedImage}
          onError={setError}
        />
        <View className="px-5">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nome do PEC"
            placeholderTextColor={colors.neutralDark}
            accessibilityLabel="Nome do PEC"
            className="rounded-3xl border border-neutral bg-neutral-light px-4 font-quicksand text-xl text-dark"
            style={{ fontFamily: FONT_FAMILY, fontSize: 20, height: 64 }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="flex-row gap-2 px-5">
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
                    selected ? "border-4 border-primary" : "border-2 border-transparent"
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
          icon="volume-loud"
          accessibilityLabel="Ouvir o nome do PEC"
          variant="primary"
          size="lg"
          iconSize={28}
          disabled={!canHear}
          inactiveReason={canHear ? undefined : "Escreva o nome"}
          className="self-center"
          onPress={hearTitle}
        />

        <FormError message={previewFailed ? "Não consegui abrir essa imagem. Escolha outra foto." : null} />
        <FormError message={error} />
      </ScrollView>

      <View className="flex-row gap-3 px-5 pt-2" style={{ paddingBottom: insets.bottom }}>
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
          inactiveReason={pecSaveReason(name, categorySlug, previewUri)}
          className="flex-1"
          onPress={handleSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
