import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenModal } from "@/components/AppModal";
import { Button } from "@/components/Button";
import * as ImagePicker from "expo-image-picker";
import { Category } from "@/types";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { CustomPec, NewCustomPec } from "@/services/customPecs";

interface AddPecModalProps {
  visible: boolean;
  categories: Category[];
  initialCategorySlug: string;
  initialPec?: CustomPec | null;
  onClose: () => void;
  onSubmit: (input: NewCustomPec) => Promise<void>;
}

function existingImage(pec?: CustomPec | null) {
  return pec?.localUri || pec?.imageUrl || "";
}

export function AddPecModal({
  visible,
  categories,
  initialCategorySlug,
  initialPec,
  onClose,
  onSubmit,
}: AddPecModalProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(initialPec?.title ?? "");
    setCategorySlug(initialPec?.categorySlug ?? initialCategorySlug);
    setLocalUri(existingImage(initialPec) || null);
    setImageChanged(false);
    setPreviewFailed(false);
    setError(null);
    setSaving(false);
  }, [visible, initialCategorySlug, initialPec]);

  const previewUri = localUri && !previewFailed ? localUri : null;

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
    } catch {
      setError("Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  };

  const openGoogleImages = () => {
    const query = title.trim() || "pictograma";
    Linking.openURL(
      `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,
    );
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

  return (
    <ScreenModal
      visible={visible}
      title={initialPec ? "Editar PEC" : "Novo PEC"}
      onClose={onClose}
      avoidKeyboard
    >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 32,
            gap: 18,
          }}
        >
          <View className="gap-2">
            <Text className="font-quicksand text-xl text-dark">Nome</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Bola"
              placeholderTextColor={colors.neutralDark}
              className="rounded-2xl border border-neutral bg-neutral-light px-4 text-dark"
              style={{ fontSize: 18, height: 56 }}
            />
          </View>

          <View className="gap-2">
            <Text className="font-quicksand text-xl text-dark">Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.map((category) => {
                  const selected = category.slug === categorySlug;
                  const colorName =
                    category.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
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
                        style={{ color: selected ? getCategoryColor(colorName) : colors.neutralDark }}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View className="gap-2">
            <Text className="font-quicksand text-xl text-dark">Imagem</Text>
            <View className="flex-row flex-wrap gap-2">
              <Button label="Tirar foto" icon="camera" variant="soft" size="md" onPress={takePhoto} />
              <Button
                label="Do dispositivo"
                icon="gallery"
                variant="soft"
                size="md"
                accessibilityLabel="Escolher foto do dispositivo"
                onPress={pickFromDevice}
              />
              <Button
                label="Buscar no Google"
                icon="magnifier"
                variant="soft"
                size="md"
                onPress={openGoogleImages}
              />
            </View>
            <Text className="font-quicksand text-lg text-neutral-dark">
              No Google, segure a foto e escolha salvar no dispositivo. Depois, toque em Do dispositivo e selecione essa imagem.
            </Text>
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                onError={() => setPreviewFailed(true)}
                className="h-36 w-36 rounded-3xl bg-muted"
                resizeMode="cover"
              />
            ) : null}
            {previewFailed ? (
              <Text className="font-quicksand text-lg text-danger">
                Não consegui abrir essa imagem. Escolha outra foto do dispositivo.
              </Text>
            ) : null}
          </View>

          {error ? (
            <Text className="font-quicksand text-xl text-danger">{error}</Text>
          ) : null}

          <Button
            label={initialPec ? "Salvar alterações" : "Salvar PEC"}
            loading={saving}
            onPress={handleSave}
          />
        </ScrollView>
    </ScreenModal>
  );
}
