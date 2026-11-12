import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Image, ScrollView, Pressable, Platform, TextInput, KeyboardAvoidingView } from "react-native";
import { SolarIcon } from "@/components/SolarIcon";
import { Button } from "@/components/Button";
import { FormError } from "@/components/ScreenState";
import { ImageSourcePicker } from "@/components/ImageSourcePicker";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { pecLabel } from "@/data/pecLabels";
import { useI18n } from "@/i18n";
import {
  inferVoiceGender,
  languagePreview,
  ratePreview,
  SpeechLanguage,
  SpeechRate,
  voicePreview,
  voiceSummary,
  VoiceGender,
} from "@/services/appSettings";
import { AVATAR_V1, AVATAR_V2, AVATAR_V3, AvatarChoice, ChildSex, profileAvatarSource } from "@/services/profile";
import { loadTopWords, UsedWord } from "@/services/wordUsage";
import { VoicePickerModal } from "@/components/VoicePickerModal";

export default function ProfileScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editRequestHandled = useRef(edit === "1");
  const insets = useSafeAreaInsets();
  const { ready, profile, saveProfile } = useProfile();
  const copy = useI18n();
  const { settings, voices, updateSettings, speak, haptic } = useAppSettings();
  const [nickname, setNickname] = useState(profile.nickname);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState<AvatarChoice>(profile.avatar);
  const [sex, setSex] = useState<ChildSex>(profile.sex);
  const [photoUri, setPhotoUri] = useState<string | null>(profile.photoUri ?? null);
  const [words, setWords] = useState<UsedWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(edit === "1");
  const [voiceOpen, setVoiceOpen] = useState(false);

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
    setSex(profile.sex);
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

  const voiceLabel = voiceSummary(voices, settings)
    .replace("Feminina", copy.voice.feminine)
    .replace("Masculina", copy.voice.masculine);

  const dirty =
    nickname.trim() !== profile.nickname ||
    name.trim() !== profile.name ||
    avatar !== profile.avatar ||
    sex !== profile.sex ||
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

  const chooseSex = (next: ChildSex) => {
    setSex(next);
    setError(null);
    setSaved(false);
  };

  const chooseGender = (gender: VoiceGender) => {
    const patch = { voiceGender: gender, voiceId: null };
    updateSettings(patch);
    speak(voicePreview(settings.language), patch);
    haptic();
  };

  const chooseVoice = (voiceId: string) => {
    const voice = voices.find((item) => item.identifier === voiceId);
    const inferred = voice ? inferVoiceGender(voice) : null;
    const patch = { voiceId, voiceGender: inferred ?? settings.voiceGender };
    updateSettings(patch);
    speak(voicePreview(settings.language), patch);
    haptic();
  };

  const chooseLanguage = (language: SpeechLanguage) => {
    const patch = { language, voiceId: null };
    updateSettings(patch);
    speak(languagePreview(language), patch);
    haptic();
  };

  const chooseRate = (speechRate: SpeechRate) => {
    updateSettings({ speechRate });
    speak(ratePreview(settings.language), { speechRate });
    haptic();
  };

  const handleCancel = () => {
    setNickname(profile.nickname);
    setName(profile.name);
    setAvatar(profile.avatar);
    setSex(profile.sex);
    setPhotoUri(profile.photoUri ?? null);
    setError(null);
    setSaved(false);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const next = await saveProfile({
        nickname,
        name,
        avatar,
        sex,
        pendingPhotoUri: avatar === "photo" && photoUri !== profile.photoUri ? photoUri : null,
      });
      setNickname(next.nickname);
      setName(next.name);
      setAvatar(next.avatar);
      setSex(next.sex);
      setPhotoUri(next.photoUri ?? null);
      setSaved(true);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.common.saveFailed);
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
          <Image
            source={profileAvatarSource(profile)}
            resizeMode="cover"
            className="h-28 w-28 rounded-3xl border-4 border-light"
          />
          <Text className="mt-4 font-quicksand text-3xl text-primary">{profile.nickname}</Text>
          <Text className="mt-1 px-6 text-center font-quicksand text-xl text-dark">{profile.name}</Text>
          <Text className="mt-1 font-quicksand text-lg text-neutral-dark">
            {profile.sex === "menino" ? copy.common.boy : copy.common.girl}
          </Text>
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
            <Text className="font-quicksand text-2xl text-white">{copy.profile.topWords}</Text>
            {words.length === 0 ? (
              <Text className="font-quicksand text-lg text-white/85">{copy.profile.topWordsEmpty}</Text>
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
                    <Text className="font-quicksand text-base text-dark">{pecLabel(word.title, profile.sex).toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        <View className="bg-white px-4" style={{ paddingBottom: insets.bottom }}>
          <Button
            label={copy.profile.edit}
            icon="pen"
            variant="soft"
            shape="rounded"
            size="md"
            accessibilityLabel={copy.settings.editProfile}
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
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
          }}
        >
          <ImageSourcePicker
            accessibilityLabel={copy.profile.addPhoto}
            alertTitle={copy.profile.photoTitle}
            allowsEditing
            aspect={[1, 1]}
            className="h-[76px] w-[76px] rounded-2xl border-4 border-light"
            onPicked={usePickedImage}
            onError={setError}
          />
          <AvatarChoiceButton label={copy.profile.avatarSonora} selected={avatar === "v3"} onPress={() => choosePreset("v3")}>
            <Image source={AVATAR_V3} className="h-full w-full" />
          </AvatarChoiceButton>
          <AvatarChoiceButton label={copy.profile.avatar1} selected={avatar === "v1"} onPress={() => choosePreset("v1")}>
            <Image source={AVATAR_V1} className="h-full w-full" />
          </AvatarChoiceButton>
          <AvatarChoiceButton label={copy.profile.avatar2} selected={avatar === "v2"} onPress={() => choosePreset("v2")}>
            <Image source={AVATAR_V2} className="h-full w-full" />
          </AvatarChoiceButton>
          {photoUri ? (
            <AvatarChoiceButton label={copy.profile.myPhoto} selected={avatar === "photo"} onPress={() => choosePreset("photo")}>
              <Image source={{ uri: photoUri }} className="h-full w-full" />
            </AvatarChoiceButton>
          ) : null}
        </ScrollView>

        <View className="flex-row gap-3 px-4">
          <SexChoice label={copy.common.girl} selected={sex === "menina"} onPress={() => chooseSex("menina")} />
          <SexChoice label={copy.common.boy} selected={sex === "menino"} onPress={() => chooseSex("menino")} />
        </View>

        <View className="gap-3 px-4">
          <TextInput
            accessibilityLabel={copy.common.name}
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSaved(false);
            }}
            placeholder={copy.common.name}
            placeholderTextColor={colors.neutralDark}
            maxLength={60}
            className="rounded-2xl border border-neutral bg-neutral-light px-4 font-quicksand text-xl text-dark"
            style={{ fontFamily: FONT_FAMILY, fontSize: 20, height: 64 }}
          />
          <TextInput
            accessibilityLabel={copy.common.nickname}
            value={nickname}
            onChangeText={(value) => {
              setNickname(value);
              setSaved(false);
            }}
            placeholder={copy.common.nickname}
            placeholderTextColor={colors.neutralDark}
            maxLength={24}
            className="rounded-2xl border border-neutral bg-neutral-light px-4 font-quicksand text-xl text-dark"
            style={{ fontFamily: FONT_FAMILY, fontSize: 20, height: 64 }}
          />
        </View>

        <Pressable
          accessibilityLabel={`${copy.common.voice}, ${voiceLabel}`}
          accessibilityHint={copy.profile.voiceHint}
          onPress={() => setVoiceOpen(true)}
          className="mx-4 flex-row items-center gap-3 rounded-2xl border border-neutral bg-neutral-light px-4 py-3"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
            <SolarIcon name="volume-loud" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand text-base text-neutral-dark">{copy.common.voice}</Text>
            <Text className="font-quicksand text-xl text-dark" numberOfLines={1}>
              {voiceLabel}
            </Text>
          </View>
          <SolarIcon name="arrow-right" size={20} color={colors.neutralDark} />
        </Pressable>

        <FormError message={error} className="px-4" />
      </ScrollView>
      <View className="flex-row gap-3 bg-white px-4" style={{ paddingBottom: insets.bottom }}>
        <Button
          icon="close-circle"
          label={copy.common.cancel}
          variant="neutral"
          shape="rounded"
          size="md"
          disabled={saving}
          accessibilityLabel={copy.profile.cancelEdit}
          className="flex-1"
          onPress={handleCancel}
        />
        <Button
          icon="check-circle"
          label={saved ? copy.common.saved : copy.common.save}
          variant="primary"
          shape="rounded"
          size="md"
          loading={saving}
          disabled={!dirty}
          inactiveReason={!dirty && !saved ? copy.profile.noChanges : undefined}
          accessibilityLabel={copy.profile.saveProfile}
          className="flex-1"
          onPress={handleSave}
        />
      </View>
      <VoicePickerModal
        visible={voiceOpen}
        voices={voices}
        gender={settings.voiceGender}
        voiceId={settings.voiceId}
        language={settings.language}
        speechRate={settings.speechRate}
        onClose={() => setVoiceOpen(false)}
        onSelectGender={chooseGender}
        onSelectVoice={(voice) => chooseVoice(voice.identifier)}
        onSelectLanguage={chooseLanguage}
        onSelectRate={chooseRate}
      />
    </KeyboardAvoidingView>
  );
}

function SexChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="h-16 flex-1 items-center justify-center rounded-2xl"
      style={{
        borderWidth: 4,
        borderColor: selected ? colors.primary : colors.light,
        backgroundColor: selected ? colors.primarySoft : colors.neutralLight,
      }}
    >
      <Text className="font-quicksand text-xl text-dark">{label}</Text>
    </Pressable>
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
        borderWidth: 4,
        borderColor: selected ? colors.primary : colors.light,
      }}
    >
      {children}
    </Pressable>
  );
}
