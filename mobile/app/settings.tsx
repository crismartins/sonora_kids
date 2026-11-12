import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, Platform, Modal, TextInput, Alert, Linking } from "react-native";
import { router } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingSlider } from "@/components/OnboardingSlider";
import { SolarIcon } from "@/components/SolarIcon";
import { BottomSheet, ScreenModal } from "@/components/AppModal";
import { Button } from "@/components/Button";
import { colors } from "@/constants/colors";
import { useAppSettings } from "@/context/AppSettingsContext";
import { usePremium } from "@/context/PremiumContext";
import { useI18n } from "@/i18n";
import { VoicePickerModal } from "@/components/VoicePickerModal";
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

const SUGGESTION_RECIPIENTS = ["cristophermartins.77@gmail.com", "hello@cristophermartins.com"];

interface RowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
}

function Row({ icon, label, description, toggle, value, onToggle, onPress, destructive, isLast }: RowProps) {
  return (
    <Pressable
      onPress={toggle ? undefined : onPress}
      accessibilityLabel={label}
      className={`flex-row items-center gap-3 bg-white px-3.5 py-[13px] ${
        !isLast ? "border-b border-muted" : ""
      } ${!toggle ? "active:bg-canvas" : ""}`}
    >
      <View
        className="h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: destructive ? colors.dangerSoft : colors.primarySoft }}
      >
        {icon}
      </View>
      <View className="flex-1 gap-px">
        <Text className={`font-quicksand text-xl ${destructive ? "text-danger" : "text-dark"}`}>{label}</Text>
        {description ? <Text className="font-quicksand text-base text-neutral-dark">{description}</Text> : null}
      </View>
      {toggle && onToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#E0E0E0", true: `${colors.primary}66` }}
          thumbColor={value ? colors.primary : "#9E9E9E"}
        />
      ) : (
        <SolarIcon name="arrow-right" size={20} color={colors.neutralDark} />
      )}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-1">
      <Text className="px-5 pb-1 pt-4 font-quicksand text-lg uppercase tracking-wide text-neutral-dark">
        {title}
      </Text>
      <View className="mx-4 overflow-hidden rounded-2xl border border-line bg-white">{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, voices, updateSettings, resetSettings, speak, haptic } = useAppSettings();
  const { isPremium, openPaywall } = usePremium();
  const copy = useI18n();
  const [guideOpen, setGuideOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [suggestionSent, setSuggestionSent] = useState(false);

  const languageLabel = copy.voice.languages[settings.language];

  const chooseGender = (gender: VoiceGender) => {
    updateSettings({ voiceGender: gender, voiceId: null });
    speak(voicePreview(settings.language), { voiceGender: gender, voiceId: null });
    haptic();
  };

  const chooseVoice = (voiceId: string) => {
    const voice = voices.find((item) => item.identifier === voiceId);
    const inferred = voice ? inferVoiceGender(voice) : null;
    const patch = {
      voiceId,
      voiceGender: inferred ?? settings.voiceGender,
    };
    updateSettings(patch);
    speak(voicePreview(settings.language), patch);
    haptic();
  };

  const chooseLanguage = (language: SpeechLanguage) => {
    updateSettings({ language, voiceId: null });
    speak(languagePreview(language), { language, voiceId: null });
    haptic();
  };

  const chooseRate = (speechRate: SpeechRate) => {
    updateSettings({ speechRate });
    speak(ratePreview(settings.language), { speechRate });
    haptic();
  };

  const confirmReset = () => {
    Alert.alert(copy.settings.resetTitle, copy.settings.resetBody, [
      { text: copy.common.cancel, style: "cancel" },
      {
        text: copy.settings.resetAction,
        style: "destructive",
        onPress: () => {
          resetSettings();
        },
      },
    ]);
  };

  const sendSuggestion = async () => {
    const text = suggestion.trim();
    if (!text) return;
    const url = `mailto:${SUGGESTION_RECIPIENTS.join(",")}?subject=${encodeURIComponent(copy.settings.suggestionSubject)}&body=${encodeURIComponent(text)}`;
    try {
      await Linking.openURL(url);
      setSuggestion("");
      setSuggestionSent(true);
    } catch {
      Alert.alert(copy.settings.suggestionTitle, copy.settings.suggestionMailMissing);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingTop: 8,
        paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 32,
      }}
    >
      <Section title={copy.premium.settingsTitle}>
        <Row
          icon={<SolarIcon name="crown" size={20} color={colors.primary} />}
          label={isPremium ? copy.premium.ownedTitle : copy.premium.unlock}
          description={isPremium ? copy.premium.settingsUnlocked : copy.premium.settingsLocked}
          onPress={openPaywall}
          isLast
        />
      </Section>

      <Section title={copy.settings.firstSteps}>
        <Row
          icon={<SolarIcon name="flag" size={20} color={colors.primary} />}
          label={copy.settings.guide}
          description={copy.settings.guideDetail}
          onPress={() => setGuideOpen(true)}
        />
        <Row
          icon={<SolarIcon name="book" size={20} color={colors.primary} />}
          label={copy.settings.intro}
          description={copy.settings.introDetail}
          onPress={() => setIntroOpen(true)}
          isLast
        />
      </Section>

      <Section title={copy.settings.communication}>
        <Row
          icon={<SolarIcon name="volume-loud" size={20} color={colors.primary} />}
          label={copy.common.voice}
          description={`${languageLabel} · ${voiceSummary(voices, settings).replace("Feminina", copy.voice.feminine).replace("Masculina", copy.voice.masculine)} · ${copy.voice.rates[settings.speechRate]}`}
          onPress={() => setVoiceOpen(true)}
        />
        <Row
          icon={<SolarIcon name="microphone" size={20} color={colors.primary} />}
          label={copy.settings.autoSpeak}
          description={copy.settings.autoSpeakDetail}
          toggle
          value={settings.autoSpeakCategories}
          onToggle={(value) => updateSettings({ autoSpeakCategories: value })}
          isLast
        />
      </Section>

      <Section title={copy.settings.access}>
        <Row
          icon={<SolarIcon name="vibration" size={20} color={colors.primary} />}
          label={copy.settings.haptics}
          toggle
          value={settings.haptics}
          onToggle={(value) => {
            updateSettings({ haptics: value });
            if (value && Platform.OS !== "web") {
              haptic();
            }
          }}
        />
        <Row
          icon={<SolarIcon name="text-field" size={20} color={colors.primary} />}
          label={copy.settings.largeText}
          description={copy.settings.largeTextDetail}
          toggle
          value={settings.largeText}
          onToggle={(value) => updateSettings({ largeText: value })}
        />
        <Row
          icon={<SolarIcon name="fallback" size={20} color={colors.primary} />}
          label={copy.settings.contrast}
          description={copy.settings.contrastDetail}
          toggle
          value={settings.highContrast}
          onToggle={(value) => updateSettings({ highContrast: value })}
          isLast
        />
      </Section>

      <Section title={copy.settings.connect}>
        <Row
          icon={<SolarIcon name="chat-round" size={20} color={colors.primary} />}
          label={copy.settings.suggestions}
          description={copy.settings.suggestionsDetail}
          onPress={() => {
            setSuggestionSent(false);
            setSuggestionOpen(true);
          }}
          isLast
        />
      </Section>

      <Section title={copy.settings.account}>
        <Row
          icon={<SolarIcon name="user" size={20} color={colors.neutralDark} />}
          label={copy.settings.editProfile}
          onPress={() => router.push("/profile")}
        />
        <Row
          icon={<SolarIcon name="trash" size={20} color={colors.danger} />}
          label={copy.settings.reset}
          destructive
          onPress={confirmReset}
          isLast
        />
      </Section>

      <Text className="mb-1 mt-3 text-center font-quicksand text-base text-neutral-dark">{copy.common.version}</Text>

      <Modal
        visible={introOpen}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setIntroOpen(false)}
      >
        <SafeAreaProvider style={{ flex: 1 }}>
          {introOpen ? <OnboardingSlider onDone={() => setIntroOpen(false)} /> : null}
        </SafeAreaProvider>
      </Modal>

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

      <BottomSheet
        visible={guideOpen}
        title={copy.settings.guideTitle}
        closeLabel={copy.settings.closeGuide}
        onClose={() => setGuideOpen(false)}
      >
        <View className="gap-3">
          {copy.settings.guideSteps.map((step, index) => (
            <View key={step} className="flex-row gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-wash">
                <Text className="font-quicksand text-xl text-primary">{index + 1}</Text>
              </View>
              <Text className="flex-1 font-quicksand text-xl text-dark">{step}</Text>
            </View>
          ))}
          <Button label={copy.common.gotIt} className="mt-2" onPress={() => setGuideOpen(false)} />
        </View>
      </BottomSheet>

      <ScreenModal visible={suggestionOpen} title={copy.settings.suggestionTitle} avoidKeyboard onClose={() => setSuggestionOpen(false)}>
        <View className="gap-4 px-5 pt-5">
          {suggestionSent ? (
            <Text className="font-quicksand text-2xl text-dark">{copy.settings.suggestionThanks}</Text>
          ) : (
            <>
              <Text className="font-quicksand text-xl text-neutral-dark">{copy.settings.suggestionPrompt}</Text>
              <TextInput
                value={suggestion}
                onChangeText={setSuggestion}
                placeholder={copy.settings.suggestionPlaceholder}
                placeholderTextColor={colors.neutralDark}
                multiline
                className="min-h-[140px] rounded-2xl border border-neutral bg-neutral-light px-4 py-3 text-dark"
                style={{ fontSize: 18, textAlignVertical: "top" }}
              />
              <Button label={copy.settings.suggestionSave} onPress={sendSuggestion} />
            </>
          )}
        </View>
      </ScreenModal>
    </ScrollView>
  );
}
