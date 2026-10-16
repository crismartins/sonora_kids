import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { PillText } from "@/components/PillText";
import { useProfile } from "@/context/ProfileContext";
import { AVATAR_V1, AVATAR_V2, AvatarChoice } from "@/services/profile";
import { loadTopWords, UsedWord } from "@/services/wordUsage";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { ready, profile, saveProfile } = useProfile();
  const [nickname, setNickname] = useState(profile.nickname);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState<AvatarChoice>(profile.avatar);
  const [photoUri, setPhotoUri] = useState<string | null>(profile.photoUri ?? null);
  const [words, setWords] = useState<UsedWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setNickname(profile.nickname);
    setName(profile.name);
    setAvatar(profile.avatar);
    setPhotoUri(profile.photoUri ?? null);
  }, [ready, profile]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadTopWords()
        .then((top) => {
          if (active) setWords(top);
        })
        .catch(() => {
          if (active) setWords([]);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 1400);
    return () => clearTimeout(timer);
  }, [saved]);

  const previewSource =
    avatar === "photo" && photoUri
      ? { uri: photoUri }
      : avatar === "v2"
        ? AVATAR_V2
        : AVATAR_V1;

  const dirty =
    nickname.trim() !== profile.nickname ||
    name.trim() !== profile.name ||
    avatar !== profile.avatar ||
    (avatar === "photo" && photoUri !== (profile.photoUri ?? null));

  const choosePreset = (choice: AvatarChoice) => {
    if (choice === "photo" && !photoUri) return;
    setAvatar(choice);
    setError(null);
    setSaved(false);
  };

  const usePickedImage = (uri: string) => {
    setAvatar("photo");
    setPhotoUri(uri);
    setError(null);
    setSaved(false);
  };

  const pickFromGallery = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setError("Permita o acesso às fotos para escolher uma imagem.");
          if (!permission.canAskAgain) Linking.openSettings().catch(() => undefined);
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (!uri) return;
      usePickedImage(uri);
    } catch {
      setError("Não foi possível abrir a galeria.");
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError("Permita o uso da câmera para tirar a foto.");
          if (!permission.canAskAgain) Linking.openSettings().catch(() => undefined);
          return;
        }
      }
      const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
      const uri = result.canceled ? null : result.assets[0]?.uri;
      if (!uri) return;
      usePickedImage(uri);
    } catch {
      setError("Não foi possível abrir a câmera.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const next = await saveProfile({
        nickname,
        name,
        avatar,
        pendingPhotoUri: avatar === "photo" && photoUri !== profile.photoUri ? photoUri : null,
      });
      setNickname(next.nickname);
      setName(next.name);
      setAvatar(next.avatar);
      setPhotoUri(next.photoUri ?? null);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 32,
          gap: 20,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-[28px] border-[3px] border-primary">
          <Image source={previewSource} className="h-[120px] w-[120px]" />
        </View>

        <View className="w-full gap-3">
          <View className="flex-row justify-center gap-3">
            <AvatarChoiceButton
              label="Avatar 1"
              selected={avatar === "v1"}
              onPress={() => choosePreset("v1")}
            >
              <Image source={AVATAR_V1} className="h-full w-full" />
            </AvatarChoiceButton>
            <AvatarChoiceButton
              label="Avatar 2"
              selected={avatar === "v2"}
              onPress={() => choosePreset("v2")}
            >
              <Image source={AVATAR_V2} className="h-full w-full" />
            </AvatarChoiceButton>
            {photoUri ? (
              <AvatarChoiceButton
                label="Minha foto"
                selected={avatar === "photo"}
                onPress={() => choosePreset("photo")}
              >
                <Image source={{ uri: photoUri }} className="h-full w-full" />
              </AvatarChoiceButton>
            ) : null}
          </View>
          <View className="flex-row justify-center gap-3">
            <AvatarChoiceButton label="Tirar foto" selected={false} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={26} color={colors.primary} />
            </AvatarChoiceButton>
            <AvatarChoiceButton label="Galeria" selected={false} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={26} color={colors.primary} />
            </AvatarChoiceButton>
          </View>
        </View>

        <View className="w-full gap-3">
          <View className="gap-1.5">
            <Text className="font-quicksand text-lg text-neutral-dark">Apelido</Text>
            <TextInput
              accessibilityLabel="Apelido"
              value={nickname}
              onChangeText={(value) => {
                setNickname(value);
                setSaved(false);
              }}
              placeholder="Como a criança é chamada"
              placeholderTextColor={colors.neutralDark}
              maxLength={24}
              className="rounded-2xl border border-[#E4F4FF] bg-[#FDFEFF] px-4 text-center text-primary"
              style={{ fontFamily: FONT_FAMILY, fontSize: 28, height: 64, color: colors.primary }}
            />
          </View>
          <View className="gap-1.5">
            <Text className="font-quicksand text-lg text-neutral-dark">Nome</Text>
            <TextInput
              accessibilityLabel="Nome"
              value={name}
              onChangeText={(value) => {
                setName(value);
                setSaved(false);
              }}
              placeholder="Nome completo"
              placeholderTextColor={colors.neutralDark}
              maxLength={60}
              className="rounded-2xl border border-[#E4F4FF] bg-[#FDFEFF] px-4 text-center text-dark"
              style={{ fontFamily: FONT_FAMILY, fontSize: 18, height: 56, color: colors.dark }}
            />
          </View>
        </View>

        {error ? (
          <Text className="w-full text-center font-quicksand text-lg text-[#D32F2F]">{error}</Text>
        ) : null}

        <Pressable
          accessibilityLabel="Salvar perfil"
          onPress={handleSave}
          disabled={saving || !dirty}
          className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4"
          style={{ opacity: saving || !dirty ? 0.55 : 1 }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={saved ? "checkmark" : "checkmark-circle-outline"} size={20} color="#fff" />
              <Text className="font-quicksand text-[22px] text-white">
                {saved ? "Salvo" : "Salvar"}
              </Text>
            </>
          )}
        </Pressable>

        <View className="w-full gap-3.5 rounded-3xl bg-primary p-5">
          <Text className="font-quicksand text-[26px] text-white">Palavras mais usadas</Text>
          {words.length === 0 ? (
            <Text className="font-quicksand text-lg text-white/85">
              As 10 palavras mais faladas aparecem aqui conforme os PECS forem usados.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {words.map((word) => (
                <View
                  key={word.title}
                  className="h-8 flex-row items-center gap-1.5 rounded-full px-2.5"
                  style={{ backgroundColor: getCategoryBgColor(word.color) }}
                >
                  <View className="h-5 min-w-[26px] items-center justify-center rounded-full bg-white/85 px-1.5">
                    <PillText size={14} style={{ color: "#001D4A" }}>
                      {word.count}
                    </PillText>
                  </View>
                  <PillText size={15} style={{ color: getCategoryColor(word.color) }}>
                    {word.title}
                  </PillText>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AvatarChoiceButton({
  label,
  selected,
  onPress,
  children,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="w-[76px] items-center gap-1.5"
    >
      <View
        className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-2xl bg-[#F5F5F5]"
        style={{
          borderWidth: selected ? 3 : 0,
          borderColor: colors.primary,
        }}
      >
        {children}
      </View>
      <Text className="text-center font-quicksand text-sm text-neutral-dark">{label}</Text>
    </Pressable>
  );
}
