import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView, ImageSourcePropType } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton } from "@/components/Button";
import { FormError } from "@/components/ScreenState";
import { ImageSourcePicker } from "@/components/ImageSourcePicker";
import { Category } from "@/types";
import { localizeName, useI18n } from "@/i18n";
import { colors } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { useAppSettings } from "@/context/AppSettingsContext";
import { CustomPec, NewCustomPec } from "@/services/customPecs";
import { isQuotaError } from "@/services/quota";

export type PecFormRequest = {
  categories: Category[];
  initialCategorySlug: string;
  initialPec?: CustomPec | null;
  imageOnly?: boolean;
  initialPreview?: ImageSourcePropType | null;
  onSubmit: (input: NewCustomPec) => Promise<void>;
  onRestore?: () => Promise<void>;
  onClose?: () => void;
};

let request: PecFormRequest | null = null;
let open = false;

export function openPecForm(next: PecFormRequest) {
  if (open) return;
  request = next;
  open = true;
  try {
    router.push("/pec");
  } catch (error) {
    request = null;
    open = false;
    throw error;
  }
}

export function currentPecForm() {
  return request;
}

export function isPecFormOpen() {
  return open;
}

export function finishPecForm() {
  if (!open && !request) return;
  const closing = request;
  request = null;
  open = false;
  closing?.onClose?.();
}

interface AddPecFormProps {
  categories: Category[];
  initialCategorySlug: string;
  initialPec?: CustomPec | null;
  imageOnly?: boolean;
  initialPreview?: ImageSourcePropType | null;
  onClose: () => void;
  onSubmit: (input: NewCustomPec) => Promise<void>;
  onRestore?: () => Promise<void>;
}

function existingImage(pec?: CustomPec | null) {
  return pec?.localUri || pec?.imageUrl || "";
}

function pecSaveReason(
  labels: { choosePhoto: string; writeName: string; chooseCategory: string },
  name: string,
  categorySlug: string,
  previewUri: string | null,
  imageOnly = false,
) {
  if (imageOnly) return previewUri ? undefined : labels.choosePhoto;
  if (!name) return labels.writeName;
  if (!categorySlug) return labels.chooseCategory;
  if (!previewUri) return labels.choosePhoto;
  return undefined;
}

export function AddPecForm({
  categories,
  initialCategorySlug,
  initialPec,
  imageOnly = false,
  initialPreview,
  onClose,
  onSubmit,
  onRestore,
}: AddPecFormProps) {
  const insets = useSafeAreaInsets();
  const { speak } = useAppSettings();
  const copy = useI18n();
  const [title, setTitle] = useState(initialPec?.title ?? "");
  const [categorySlug, setCategorySlug] = useState(initialPec?.categorySlug ?? initialCategorySlug);
  const [localUri, setLocalUri] = useState<string | null>(imageOnly ? null : existingImage(initialPec) || null);
  const [imageChanged, setImageChanged] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const previewUri = localUri && !previewFailed ? localUri : null;
  const pickedUri = imageChanged ? previewUri : null;
  const name = title.trim();
  const canHear = name.length > 0;
  const canSave = imageOnly ? !!pickedUri && !saving : canHear && !!categorySlug && !!previewUri && !saving;

  const handleRestore = async () => {
    if (!onRestore || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onRestore();
      onClose();
    } catch {
      setError(copy.pec.resetFailed);
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const name = title.trim();
    if (imageOnly) {
      if (!imageChanged || !localUri) {
        setError(copy.pec.choosePhotoFull);
        return;
      }
      setSaving(true);
      setError(null);
      try {
        await onSubmit({ title: name, categorySlug, localUri });
        onClose();
      } catch (error) {
        if (!isQuotaError(error)) setError(copy.common.tryAgain);
        setSaving(false);
      }
      return;
    }
    if (!name) {
      setError(copy.pec.writeNameFull);
      return;
    }
    if (!categorySlug) {
      setError(copy.pec.chooseCategoryFull);
      return;
    }
    const keepingImage = !!initialPec && !imageChanged;
    if (!keepingImage && !localUri) {
      setError(copy.pec.choosePhotoFull);
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
    } catch (error) {
      if (!isQuotaError(error)) setError(copy.common.tryAgain);
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
          accessibilityLabel={copy.pec.addPhoto}
          alertTitle={copy.pec.photoTitle}
          previewUri={previewUri}
          previewSource={imageOnly && !previewUri ? initialPreview : null}
          onPreviewError={() => setPreviewFailed(true)}
          className="h-24 w-24 self-center rounded-3xl"
          iconSize={36}
          onPicked={usePickedImage}
          onError={setError}
        />
        {imageOnly && onRestore ? (
          <View className="px-5">
            <Button
              label={copy.pec.resetImage}
              icon="refresh"
              variant="muted"
              shape="rounded"
              size="md"
              disabled={saving}
              onPress={handleRestore}
            />
          </View>
        ) : null}
        {imageOnly ? null : (
        <>
        <View className="px-5">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={copy.pec.namePlaceholder}
            placeholderTextColor={colors.neutralDark}
            accessibilityLabel={copy.pec.nameLabel}
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
                    if (category.name) speak(localizeName(category.name));
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
                  <Text className="font-quicksand text-lg text-dark">{localizeName(category.name).toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        </>
        )}

        <IconButton
          icon="volume-loud"
          accessibilityLabel={copy.pec.hearName}
          variant="primary"
          size="lg"
          iconSize={28}
          disabled={!canHear}
          inactiveReason={canHear ? undefined : copy.pec.writeName}
          className="self-center"
          onPress={hearTitle}
        />

        <FormError message={previewFailed ? copy.pec.badImage : null} />
        <FormError message={error} />
      </ScrollView>

      <View className="flex-row gap-3 px-5 pt-2" style={{ paddingBottom: insets.bottom }}>
        <Button
          label={copy.common.exit}
          icon="close-circle"
          variant="soft"
          shape="rounded"
          size="md"
          disabled={saving}
          className="flex-1"
          onPress={onClose}
        />
        <Button
          label={copy.common.save}
          icon="check-circle"
          shape="rounded"
          size="md"
          loading={saving}
          disabled={!canSave}
          inactiveReason={pecSaveReason(copy.pec, name, categorySlug, imageOnly ? pickedUri : previewUri, imageOnly)}
          className="flex-1"
          onPress={handleSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
