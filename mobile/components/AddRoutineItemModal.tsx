import React, { useState } from "react";
import { View, Text, ScrollView, Image, ImageSourcePropType } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, FloatingButton, IconButton } from "@/components/Button";
import { CategoryPill } from "@/components/CategoryPill";
import { PecCard } from "@/components/PecCard";
import { FormError } from "@/components/ScreenState";
import { openPecForm } from "@/components/AddPecModal";
import { Category, PecItem } from "@/types";
import { getCategoryBgColor } from "@/constants/colors";
import { useAppSettings } from "@/context/AppSettingsContext";
import { CustomPec, NewCustomPec } from "@/services/customPecs";
import { DayPeriod, PERIOD_LABELS, DAY_LABELS } from "@/services/routine";

const DIA_A_DIA = "dia-a-dia";
const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export interface RoutinePecOption {
  id: string;
  title: string;
  image?: ImageSourcePropType;
}

export type RoutinePick = {
  id: string;
  title: string;
  image?: string;
  color: string;
};

export type RoutineFormRequest = {
  day: number;
  period: DayPeriod;
  initialSelected: RoutinePick[];
  getCategories: () => Category[];
  addPec: (input: NewCustomPec) => Promise<CustomPec>;
  onSubmit: (items: RoutinePick[]) => Promise<void>;
  onClose?: () => void;
};

let request: RoutineFormRequest | null = null;
let open = false;

export function openRoutineForm(next: RoutineFormRequest) {
  if (open) return;
  open = true;
  request = next;
  router.push("/rotina-item");
}

export function currentRoutineForm() {
  return request;
}

export function finishRoutineForm() {
  const closing = request;
  request = null;
  open = false;
  closing?.onClose?.();
}

export function routineFormTitle(day: number, period: DayPeriod) {
  return `${PERIOD_LABELS[period]} · ${DAY_LABELS[day]}`;
}

function categoryColorName(category: Category) {
  return category.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
}

function pecImageUri(pec: PecItem) {
  return pec.featuredImage?.node?.sourceUrl || undefined;
}

export function AddRoutineForm({
  initialSelected,
  getCategories,
  addPec,
  onClose,
  onSubmit,
}: Omit<RoutineFormRequest, "day" | "period" | "onClose"> & { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { settings, speak } = useAppSettings();
  const categories = getCategories();
  const [selected, setSelected] = useState<RoutinePick[]>(initialSelected);
  const [extras, setExtras] = useState<{ slug: string; pec: PecItem }[]>([]);
  const [categorySlug, setCategorySlug] = useState(
    categories.find((category) => category.slug === DIA_A_DIA)?.slug ?? categories[0]?.slug ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((category) => category.slug === categorySlug) ?? categories[0];
  const selectedColor = selectedCategory ? categoryColorName(selectedCategory) : "blue";
  const catalogPecs = selectedCategory?.pECS?.nodes ?? [];
  const pecs = [
    ...catalogPecs,
    ...extras
      .filter((extra) => extra.slug === categorySlug && !catalogPecs.some((item) => item.id === extra.pec.id))
      .map((extra) => extra.pec),
  ];
  const spoken = selected
    .map((item) => item.title)
    .join(" ")
    .trim();
  const canHear = spoken.length > 0;
  const canSave = !saving;

  const addPick = (pec: PecItem, color = selectedColor) => {
    setSelected((current) => {
      if (current.some((item) => item.id === pec.id)) return current;
      return [...current, { id: pec.id, title: pec.title, image: pecImageUri(pec), color }];
    });
    speak(pec.title);
  };

  const createPec = () => {
    const slug = categorySlug || DIA_A_DIA;
    openPecForm({
      categories: getCategories(),
      initialCategorySlug: slug,
      onSubmit: async (input) => {
        const pec = await addPec(input);
        const color =
          getCategories().find((category) => category.slug === input.categorySlug)?.categoriasDePec
            ?.configuracoesCategorias?.cor ?? selectedColor;
        const created: PecItem = {
          id: pec.id,
          title: pec.title,
          featuredImage: { node: { sourceUrl: pec.localUri || pec.imageUrl } },
        };
        setExtras((current) => [...current, { slug: input.categorySlug, pec: created }]);
        addPick(created, color);
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(selected);
      onClose();
    } catch {
      setError("Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="min-h-[72px] flex-row flex-wrap gap-2 px-5 pt-4">
          {selected.map((item) => (
            <View
              key={item.id}
              className="h-14 flex-row items-center gap-1.5 rounded-full py-1 pl-1 pr-1"
              style={{ backgroundColor: getCategoryBgColor(item.color) }}
            >
              <Image source={item.image ? { uri: item.image } : FALLBACK_IMAGE} className="h-10 w-10 rounded-full" />
              <View className="h-9 max-w-[140px] items-center justify-center rounded-xl bg-white px-3">
                <Text className="font-quicksand text-lg text-dark" numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
              <IconButton
                icon="close-circle"
                variant="ghost"
                size="sm"
                accessibilityLabel={`Remover ${item.title}`}
                onPress={() => setSelected((current) => current.filter((entry) => entry.id !== item.id))}
              />
            </View>
          ))}
        </View>

        <IconButton
          icon="volume-loud"
          accessibilityLabel="Ouvir os itens da rotina"
          variant="primary"
          size="lg"
          iconSize={28}
          disabled={!canHear}
          className="mt-4 self-center"
          onPress={() => speak(spoken)}
        />

        <View className="mx-5 mt-5 h-px bg-line" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        >
          {categories.map((category) => (
            <CategoryPill
              key={category.slug}
              slug={category.slug}
              name={category.name}
              colorName={categoryColorName(category)}
              selected={category.slug === selectedCategory?.slug}
              highContrast={settings.highContrast}
              onPress={() => {
                setCategorySlug(category.slug);
                if (category.name) speak(category.name);
              }}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 4 }}
        >
          {pecs.length === 0 ? (
            <Text className="py-6 font-quicksand text-lg text-neutral-dark">Nenhum PEC nesta categoria</Text>
          ) : (
            pecs.map((pec) => (
              <PecCard
                key={pec.id}
                item={pec}
                compact
                colorName={selectedColor}
                backgroundColor={getCategoryBgColor(selectedColor)}
                onPress={() => addPick(pec)}
              />
            ))
          )}
        </ScrollView>

        <FormError message={error} className="mt-4 px-5" />
      </ScrollView>

      <View className="items-end px-5 pb-2">
        <FloatingButton icon="widget-add" tooltip="Adicionar" accessibilityLabel="Criar PEC" onPress={createPec} />
      </View>
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
          className="flex-1"
          onPress={handleSave}
        />
      </View>
    </View>
  );
}
