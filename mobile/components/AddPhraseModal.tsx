import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SolarIcon } from "@/components/SolarIcon";
import { ScreenModal } from "@/components/AppModal";
import { Button } from "@/components/Button";
import { Category, PhraseItem } from "@/types";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { CustomPhrase } from "@/services/customPhrases";
import { PillText } from "@/components/PillText";

const MAX_ITEMS = 8;

interface AddPhraseModalProps {
  visible: boolean;
  categories: Category[];
  initialPhrase?: CustomPhrase | null;
  onClose: () => void;
  onSubmit: (items: PhraseItem[]) => Promise<void>;
}

function categoryColor(category: Category) {
  return category.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
}

export function AddPhraseModal({
  visible,
  categories,
  initialPhrase,
  onClose,
  onSubmit,
}: AddPhraseModalProps) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<PhraseItem[]>([]);
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!visible) {
      openedFor.current = null;
      return;
    }
    const token = initialPhrase?.id ?? "new";
    if (openedFor.current === token) return;
    openedFor.current = token;
    setItems(initialPhrase?.items.map((item) => ({ text: item.text, color: item.color })) ?? []);
    setCategorySlug(categories[0]?.slug ?? "");
    setError(null);
    setSaving(false);
  }, [visible, initialPhrase, categories]);

  const selectedCategory =
    categories.find((category) => category.slug === categorySlug) ?? categories[0];
  const pecs = selectedCategory?.pECS?.nodes ?? [];
  const selectedColor = selectedCategory ? categoryColor(selectedCategory) : "blue";

  const addPec = (text: string) => {
    if (items.length >= MAX_ITEMS) {
      setError(`A frase pode ter até ${MAX_ITEMS} PECs.`);
      return;
    }
    setItems((current) => [...current, { text, color: selectedColor }]);
    setError(null);
  };

  const removeAt = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setError(null);
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setError("Toque em um PEC para montar a frase.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(items);
    } catch {
      setError("Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title={initialPhrase ? "Editar frase" : "Nova frase"} onClose={onClose}>
        <View className="gap-2 border-b border-line px-5 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-quicksand text-xl text-dark">Frase</Text>
            {items.length > 0 ? (
              <Pressable accessibilityLabel="Limpar frase" onPress={() => setItems([])}>
                <Text className="font-quicksand text-xl text-primary">Limpar</Text>
              </Pressable>
            ) : null}
          </View>
          <View className="min-h-[64px] flex-row flex-wrap gap-1 rounded-2xl border border-neutral bg-neutral-light p-2.5">
            {items.length === 0 ? (
              <Text className="font-quicksand text-xl text-neutral-dark">
                Toque nos PECs para montar a frase
              </Text>
            ) : (
              items.map((item, index) => (
                <Pressable
                  key={`${item.text}-${index}`}
                  accessibilityLabel={`Remover ${item.text}`}
                  onPress={() => removeAt(index)}
                  className="h-9 flex-row items-center gap-1 rounded-full pl-3 pr-2"
                  style={{ backgroundColor: getCategoryBgColor(item.color) }}
                >
                  <PillText size={18} style={{ color: getCategoryColor(item.color) }}>
                    {item.text}
                  </PillText>
                  <SolarIcon name="close" size={14} color={getCategoryColor(item.color)} />
                </Pressable>
              ))
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 32,
            gap: 18,
          }}
        >
          <View className="gap-2">
            <Text className="font-quicksand text-xl text-dark">Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.map((category) => {
                  const selected = category.slug === selectedCategory?.slug;
                  const colorName = categoryColor(category);
                  const icon = categoryIconBySlug[category.slug];
                  return (
                    <Pressable
                      key={category.slug}
                      onPress={() => setCategorySlug(category.slug)}
                      className="h-11 flex-row items-center gap-1.5 rounded-full px-3"
                      style={{
                        backgroundColor: selected ? getCategoryBgColor(colorName) : colors.muted,
                      }}
                    >
                      {icon ? <CategoryIcon slug={category.slug} size={24} /> : null}
                      <Text
                        className="font-quicksand text-lg"
                        style={{
                          color: selected ? getCategoryColor(colorName) : colors.neutralDark,
                        }}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {pecs.map((pec) => (
              <Pressable
                key={pec.id}
                accessibilityLabel={`Adicionar ${pec.title}`}
                onPress={() => addPec(pec.title)}
                className="h-10 items-center justify-center rounded-full px-3"
                style={{ backgroundColor: getCategoryBgColor(selectedColor) }}
              >
                <PillText size={18} style={{ color: getCategoryColor(selectedColor) }}>
                  {pec.title}
                </PillText>
              </Pressable>
            ))}
          </View>

          {error ? <Text className="font-quicksand text-xl text-danger">{error}</Text> : null}

          <Button
            label={initialPhrase ? "Salvar alterações" : "Salvar frase"}
            loading={saving}
            onPress={handleSave}
          />
        </ScrollView>
    </ScreenModal>
  );
}
