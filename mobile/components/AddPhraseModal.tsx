import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, ImageSourcePropType } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { PecCard } from "@/components/PecCard";
import { PhraseCard } from "@/components/PhraseCard";
import { PillText } from "@/components/PillText";
import { Category, PecItem, PhraseItem } from "@/types";
import { getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { useAppSettings } from "@/context/AppSettingsContext";
import { CustomPhrase } from "@/services/customPhrases";

const MAX_ITEMS = 8;
const PILL_SIZE = 44;
const PILL_ICON = 28;

export type PhraseFormRequest = {
  categories: Category[];
  initialPhrase?: CustomPhrase | null;
  onSubmit: (items: PhraseItem[]) => Promise<void>;
  onClose?: () => void;
};

let request: PhraseFormRequest | null = null;
let open = false;

export function openPhraseForm(next: PhraseFormRequest) {
  if (open) return;
  open = true;
  request = next;
  router.push("/frase");
}

export function currentPhraseForm() {
  return request;
}

export function finishPhraseForm() {
  const closing = request;
  request = null;
  open = false;
  closing?.onClose?.();
}

interface AddPhraseFormProps {
  categories: Category[];
  initialPhrase?: CustomPhrase | null;
  onClose: () => void;
  onSubmit: (items: PhraseItem[]) => Promise<void>;
}

function categoryColorName(category: Category) {
  return category.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
}

function pecImageUri(pec: PecItem) {
  return pec.featuredImage?.node?.sourceUrl || undefined;
}

export function AddPhraseForm({ categories, initialPhrase, onClose, onSubmit }: AddPhraseFormProps) {
  const insets = useSafeAreaInsets();
  const { settings, speak } = useAppSettings();
  const [items, setItems] = useState<PhraseItem[]>(
    initialPhrase?.items.map((item) => ({ text: item.text, color: item.color, image: item.image })) ?? [],
  );
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const imagesByTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      for (const pec of category.pECS?.nodes ?? []) {
        const uri = pecImageUri(pec);
        if (!uri) continue;
        map.set(pec.title.trim().toLocaleLowerCase("pt-BR"), uri);
      }
    }
    return map;
  }, [categories]);

  const selectedCategory = categories.find((category) => category.slug === categorySlug) ?? categories[0];
  const pecs = selectedCategory?.pECS?.nodes ?? [];
  const selectedColor = selectedCategory ? categoryColorName(selectedCategory) : "blue";
  const phrase = items.map((item) => item.text).join(" ").trim();
  const canHear = phrase.length > 0;
  const canSave = canHear && !saving;
  const previewImages = useMemo(() => {
    const map = new Map<string, ImageSourcePropType>();
    for (const [title, uri] of imagesByTitle) map.set(title, { uri });
    for (const item of items) {
      if (item.image) map.set(item.text.trim().toLocaleLowerCase("pt-BR"), { uri: item.image });
    }
    return map;
  }, [imagesByTitle, items]);

  const addPec = (pec: PecItem) => {
    if (items.length >= MAX_ITEMS) {
      setError(`A frase pode ter até ${MAX_ITEMS} PECs.`);
      return;
    }
    setItems((current) => [
      ...current,
      { text: pec.title, color: selectedColor, image: pecImageUri(pec) },
    ]);
    setError(null);
    speak(pec.title);
  };

  const removeAt = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setError(null);
  };

  const handleSave = async () => {
    if (items.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(items);
      onClose();
    } catch {
      setError("Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 16 }}>
        {items.length > 0 ? (
          <PhraseCard phrase={items} images={previewImages} onRemoveItem={removeAt} />
        ) : null}

        <View className="mx-5 mt-5 h-px bg-line" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 6, paddingHorizontal: 20 }}
        >
          {categories.map((category) => {
            const selected = category.slug === selectedCategory?.slug;
            const colorName = categoryColorName(category);
            const color = getCategoryColor(colorName);
            const background = getCategoryBgColor(colorName);
            return (
              <Pressable
                key={category.slug}
                accessibilityLabel={category.name}
                accessibilityState={{ selected }}
                onPress={() => {
                  setCategorySlug(category.slug);
                  if (category.name) speak(category.name);
                }}
                className="flex-row items-center justify-center rounded-full"
                style={{
                  backgroundColor: settings.highContrast ? color : background,
                  height: PILL_SIZE,
                  width: selected ? undefined : PILL_SIZE,
                  paddingHorizontal: selected ? 10 : 0,
                  gap: selected ? 6 : 0,
                }}
              >
                <View
                  className="items-center justify-center rounded-full bg-white/60"
                  style={{ width: PILL_ICON, height: PILL_ICON }}
                >
                  {categoryIconBySlug[category.slug] ? (
                    <CategoryIcon slug={category.slug} size={PILL_ICON} />
                  ) : (
                    <PillText size={14} style={{ color: settings.highContrast ? "#FFFFFF" : color }}>
                      {category.name.slice(0, 1)}
                    </PillText>
                  )}
                </View>
                {selected ? (
                  <PillText
                    size={14}
                    style={{ color: settings.highContrast ? "#FFFFFF" : color, letterSpacing: 0.4 }}
                  >
                    {category.name.toUpperCase()}
                  </PillText>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 4 }}
        >
          {pecs.map((pec) => (
            <PecCard
              key={pec.id}
              item={pec}
              compact
              colorName={selectedColor}
              backgroundColor={getCategoryBgColor(selectedColor)}
              onPress={() => addPec(pec)}
            />
          ))}
        </ScrollView>

        {error ? <Text className="mt-4 px-5 text-center font-quicksand text-lg text-danger">{error}</Text> : null}
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
    </View>
  );
}
