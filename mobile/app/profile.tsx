import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { SolarIcon } from "@/components/SolarIcon";
import { Button } from "@/components/Button";
import { FormError } from "@/components/ScreenState";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { inferVoiceGender, listSpeakableVoices, resolveSpeech } from "@/services/appSettings";
import { AVATAR_V1, AVATAR_V2, AvatarChoice, profileAvatarSource } from "@/services/profile";
import { loadTopWords, UsedWord } from "@/services/wordUsage";
import { VOICE_PREVIEW } from "@/components/VoicePickerModal";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

export default function ProfileScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editRequestHandled = useRef(edit === "1");
  const insets = useSafeAreaInsets();
  const { ready, profile, saveProfile } = useProfile();
  const { settings, voices, updateSettings, speak } = useAppSettings();
  const [nickname, setNickname] = useState(profile.nickname);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState<AvatarChoice>(profile.avatar);
  const [photoUri, setPhotoUri] = useState<string | null>(profile.photoUri ?? null);
  const [words, setWords] = useState<UsedWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(edit === "1");

  useEffect(() => {
    if (editRequestHandled.current || edit !== "1") return;
    editRequestHandled.current = true;
    setEditing(true);
  }, [edit]);

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

  const voiceOptions = listSpeakableVoices(voices, settings.language);
  const activeVoiceId = settings.voiceId ?? resolveSpeech(voices, settings).voice ?? null;

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

  const choosePhotoSource = () => {
    Alert.alert("Foto do perfil", "Tire uma foto ou escolha uma da galeria.", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
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

  const chooseVoice = (voiceId: string) => {
    const voice = voices.find((item) => item.identifier === voiceId);
    const inferred = voice ? inferVoiceGender(voice) : null;
    const patch = { voiceId, voiceGender: inferred ?? settings.voiceGender };
    updateSettings(patch);
    speak(VOICE_PREVIEW, patch);
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
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 28, paddingBottom: 24, alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <Image source={profileAvatarSource(profile)} className="h-28 w-28 rounded-3xl" />
          <Text className="mt-4 font-quicksand text-3xl text-primary">{profile.nickname}</Text>
          <Text className="mt-1 px-6 text-center font-quicksand text-xl text-dark">{profile.name}</Text>
          <View
            className="mx-4 mt-6 gap-3.5 self-stretch rounded-3xl bg-primary p-5"
            style={{
              shadowColor: colors.primary,
              shadowOpacity: 0.28,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <Text className="font-quicksand text-2xl text-white">Palavras mais usadas</Text>
            {words.length === 0 ? (
              <Text className="font-quicksand text-lg text-white/85">
                As 10 palavras mais faladas aparecem aqui conforme os PECS forem usados.
              </Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {words.map((word) => (
                  <View
                    key={word.title}
                    className="h-10 flex-row items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3"
                  >
                    <View className="h-8 min-w-8 items-center justify-center rounded-full bg-primary-soft px-2">
                      <Text className="font-quicksand text-base text-dark">{word.count}</Text>
                    </View>
                    <Text className="font-quicksand text-base text-dark">{word.title.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        <View className="bg-white px-4" style={{ paddingBottom: insets.bottom + 16 }}>
          <Button
            label="Editar Perfil"
            icon="pen"
            variant="soft"
            shape="rounded"
            size="md"
            accessibilityLabel="Editar perfil"
            className="w-full"
            onPress={() => setEditing(true)}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 24,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
        >
          <Pressable
            accessibilityLabel="Adicionar foto do perfil"
            onPress={choosePhotoSource}
            className="h-[76px] w-[76px] items-center justify-center rounded-2xl bg-primary-soft"
          >
            <SolarIcon name="camera" size={32} color={colors.neutralDark} />
          </Pressable>
          <AvatarChoiceButton label="Avatar 1" selected={avatar === "v1"} onPress={() => choosePreset("v1")}>
            <Image source={AVATAR_V1} className="h-full w-full" />
          </AvatarChoiceButton>
          <AvatarChoiceButton label="Avatar 2" selected={avatar === "v2"} onPress={() => choosePreset("v2")}>
            <Image source={AVATAR_V2} className="h-full w-full" />
          </AvatarChoiceButton>
          {photoUri ? (
            <AvatarChoiceButton label="Minha foto" selected={avatar === "photo"} onPress={() => choosePreset("photo")}>
              <Image source={{ uri: photoUri }} className="h-full w-full" />
            </AvatarChoiceButton>
          ) : null}
        </ScrollView>

        <View className="gap-3 px-4">
          <TextInput
            accessibilityLabel="Nome"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSaved(false);
            }}
            placeholder="Nome"
            placeholderTextColor={colors.neutralDark}
            maxLength={60}
            className="rounded-2xl border border-neutral bg-neutral-light px-4 font-quicksand text-xl text-dark"
            style={{ fontFamily: FONT_FAMILY, fontSize: 20, height: 64 }}
          />
          <TextInput
            accessibilityLabel="Apelido"
            value={nickname}
            onChangeText={(value) => {
              setNickname(value);
              setSaved(false);
            }}
            placeholder="Apelido"
            placeholderTextColor={colors.neutralDark}
            maxLength={24}
            className="rounded-2xl border border-neutral bg-neutral-light px-4 font-quicksand text-xl text-dark"
            style={{ fontFamily: FONT_FAMILY, fontSize: 20, height: 64 }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
        >
          {voiceOptions.length > 0
            ? voiceOptions.map((voice, index) => (
                <VoiceChip
                  key={voice.identifier}
                  label={`VOZ ${index + 1}`}
                  selected={voice.identifier === activeVoiceId}
                  onPress={() => chooseVoice(voice.identifier)}
                />
              ))
            : (["feminine", "masculine"] as const).map((gender, index) => (
                <VoiceChip
                  key={gender}
                  label={`VOZ ${index + 1}`}
                  selected={!settings.voiceId && settings.voiceGender === gender}
                  onPress={() => {
                    const patch = { voiceGender: gender, voiceId: null };
                    updateSettings(patch);
                    speak(VOICE_PREVIEW, patch);
                  }}
                />
              ))}
        </ScrollView>

        <FormError message={error} className="px-4" />
      </ScrollView>
      <View className="bg-white px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          label={saved ? "Salvo" : "Salvar"}
          variant="primary"
          shape="rounded"
          size="md"
          loading={saving}
          disabled={!dirty}
          accessibilityLabel="Salvar perfil"
          className="w-full"
          onPress={handleSave}
        />
      </View>
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
      className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-2xl bg-muted"
      style={{
        borderWidth: selected ? 3 : 0,
        borderColor: colors.primary,
      }}
    >
      {children}
    </Pressable>
  );
}

function VoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-14 flex-row items-center gap-2 rounded-full px-4 ${selected ? "bg-primary" : "bg-primary-soft"}`}
    >
      <SolarIcon name="volume" size={22} color={selected ? colors.white : colors.primary} />
      <Text className={`font-quicksand text-xl ${selected ? "text-white" : "text-primary"}`}>{label}</Text>
    </Pressable>
  );
}
