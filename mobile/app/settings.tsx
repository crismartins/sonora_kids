import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingSlider } from "@/components/OnboardingSlider";
import { SolarIcon } from "@/components/SolarIcon";
import { Button, IconButton } from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/constants/colors";
import { useAppSettings } from "@/context/AppSettingsContext";
import { VoicePickerModal, VOICE_PREVIEW } from "@/components/VoicePickerModal";
import {
  inferVoiceGender,
  SPEECH_RATE_LABELS,
  SpeechLanguage,
  SpeechRate,
  voiceSummary,
  VoiceGender,
} from "@/services/appSettings";

const SUGGESTIONS_KEY = "sonora.suggestions";

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

function Row({
  icon,
  label,
  description,
  toggle,
  value,
  onToggle,
  onPress,
  destructive,
  isLast,
}: RowProps) {
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
        style={{ backgroundColor: destructive ? "#FFEBEE" : colors.primarySoft }}
      >
        {icon}
      </View>
      <View className="flex-1 gap-px">
        <Text
          className={`font-quicksand text-xl ${
            destructive ? "text-danger" : "text-dark"
          }`}
        >
          {label}
        </Text>
        {description ? (
          <Text className="font-quicksand text-[15px] text-neutral-dark">
            {description}
          </Text>
        ) : null}
      </View>
      {toggle && onToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#E0E0E0", true: `${colors.primary}66` }}
          thumbColor={value ? colors.primary : "#9E9E9E"}
        />
      ) : (
        <SolarIcon name="alt-arrow-right" size={18} color="#BDBDBD" />
      )}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-1">
      <Text className="px-5 pb-[5px] pt-[18px] font-quicksand text-[17px] uppercase tracking-wide text-neutral-dark">
        {title}
      </Text>
      <View className="mx-4 overflow-hidden rounded-2xl border border-line bg-white">
        {children}
      </View>
    </View>
  );
}

const GUIDE_STEPS = [
  "Toque em um PEC para ouvir a palavra.",
  "Segure um PEC que você criou para editar ou apagar.",
  "Em Frases, toque em + e monte a frase com os PECs.",
  "Aqui você escolhe a voz, a velocidade e a vibração.",
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, voices, updateSettings, resetSettings, speak, haptic } = useAppSettings();
  const [guideOpen, setGuideOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [suggestionSent, setSuggestionSent] = useState(false);

  const languageLabel =
    settings.language === "pt-PT" ? "Português (Portugal)" : "Português (Brasil)";

  const chooseGender = (gender: VoiceGender) => {
    updateSettings({ voiceGender: gender, voiceId: null });
    speak(VOICE_PREVIEW, { voiceGender: gender, voiceId: null });
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
    speak(VOICE_PREVIEW, patch);
    haptic();
  };

  const chooseLanguage = (language: SpeechLanguage) => {
    updateSettings({ language, voiceId: null });
    speak("Olá. Este é o idioma da voz.", { language, voiceId: null });
    haptic();
  };

  const chooseRate = (speechRate: SpeechRate) => {
    updateSettings({ speechRate });
    speak("Esta é a velocidade da fala.", { speechRate });
    haptic();
    setRateOpen(false);
  };

  const confirmReset = () => {
    Alert.alert("Redefinir configurações", "Voz, velocidade, vibração e acessibilidade voltam ao padrão.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Redefinir",
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
    const raw = await AsyncStorage.getItem(SUGGESTIONS_KEY);
    let current: unknown = [];
    try {
      current = raw ? JSON.parse(raw) : [];
    } catch {
      current = [];
    }
    const next = Array.isArray(current) ? [...current, { text, at: Date.now() }] : [{ text, at: Date.now() }];
    await AsyncStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(next));
    setSuggestion("");
    setSuggestionSent(true);
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingTop: 8,
        paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 32,
      }}
    >
      <Section title="Primeiros Passos">
        <Row
          icon={<SolarIcon name="flag" size={20} color={colors.primary} />}
          label="Guia de início"
          description="Como usar PECs, frases e a voz"
          onPress={() => setGuideOpen(true)}
        />
        <Row
          icon={<SolarIcon name="book" size={20} color={colors.primary} />}
          label="Ver introdução"
          description="Reveja as telas iniciais do app"
          onPress={() => setIntroOpen(true)}
          isLast
        />
      </Section>

      <Section title="Comunicação">
        <Row
          icon={<SolarIcon name="microphone" size={20} color={colors.primary} />}
          label="Idioma da voz"
          description={languageLabel}
          onPress={() => setVoiceOpen(true)}
        />
        <Row
          icon={<SolarIcon name="user" size={20} color={colors.primary} />}
          label="Voz"
          description={voiceSummary(voices, settings)}
          onPress={() => setVoiceOpen(true)}
        />
        <Row
          icon={<SolarIcon name="volume-loud" size={20} color={colors.primary} />}
          label="Falar automaticamente"
          description="Fala ao selecionar categoria ou tela"
          toggle
          value={settings.autoSpeakCategories}
          onToggle={(value) => updateSettings({ autoSpeakCategories: value })}
        />
        <Row
          icon={<SolarIcon name="speedometer" size={20} color={colors.primary} />}
          label="Velocidade da fala"
          description={SPEECH_RATE_LABELS[settings.speechRate]}
          onPress={() => setRateOpen(true)}
          isLast
        />
      </Section>

      <Section title="Acessibilidade">
        <Row
          icon={<SolarIcon name="vibration" size={20} color="#00897B" />}
          label="Vibração (haptics)"
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
          icon={<SolarIcon name="text-field" size={20} color="#00897B" />}
          label="Texto grande"
          description="Aumenta o texto em todo o app"
          toggle
          value={settings.largeText}
          onToggle={(value) => updateSettings({ largeText: value })}
        />
        <Row
          icon={<SolarIcon name="fallback" size={20} color="#00897B" />}
          label="Alto contraste"
          description="Deixa as palavras mais fáceis de ler"
          toggle
          value={settings.highContrast}
          onToggle={(value) => updateSettings({ highContrast: value })}
          isLast
        />
      </Section>

      <Section title="Conectar">
        <Row
          icon={<SolarIcon name="microphone" size={20} color="#6A1B9A" />}
          label="Conecta à Alexa"
          description="Ainda não disponível"
          onPress={() =>
            Alert.alert(
              "Alexa",
              "A conexão com a Amazon Alexa ainda não está disponível nesta versão.",
            )
          }
        />
        <Row
          icon={<SolarIcon name="chat-round" size={20} color="#6A1B9A" />}
          label="Envie-nos Sugestões"
          description="Guarde uma ideia para melhorar o app"
          onPress={() => {
            setSuggestionSent(false);
            setSuggestionOpen(true);
          }}
          isLast
        />
      </Section>

      <Section title="Conta">
        <Row
          icon={<SolarIcon name="user" size={20} color={colors.neutralDark} />}
          label="Editar perfil"
          onPress={() => router.push("/profile")}
        />
        <Row
          icon={<SolarIcon name="cloud-download" size={20} color={colors.neutralDark} />}
          label="Sincronizar dados"
          description="Salvo neste aparelho"
          onPress={() =>
            Alert.alert(
              "Dados neste aparelho",
              "PECs, frases e configurações ficam salvos neste aparelho. Não há uma conta na nuvem para sincronizar.",
            )
          }
        />
        <Row
          icon={<SolarIcon name="trash" size={20} color={colors.danger} />}
          label="Redefinir configurações"
          destructive
          onPress={confirmReset}
          isLast
        />
      </Section>

      <Text className="mb-1 mt-3 text-center font-quicksand text-base text-[#BDBDBD]">
        App Versão 1.0
      </Text>

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
        onClose={() => setVoiceOpen(false)}
        onSelectGender={chooseGender}
        onSelectVoice={(voice) => chooseVoice(voice.identifier)}
        onSelectLanguage={chooseLanguage}
      />

      <Modal visible={rateOpen} transparent animationType="fade" onRequestClose={() => setRateOpen(false)}>
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityLabel="Fechar velocidade"
            onPress={() => setRateOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <View
            className="rounded-t-[28px] bg-white px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-neutral" />
            <Text className="mb-4 text-center font-quicksand text-3xl text-dark">
              Velocidade da fala
            </Text>
            <View className="gap-3">
              {(Object.keys(SPEECH_RATE_LABELS) as SpeechRate[]).map((rate) => {
                const selected = settings.speechRate === rate;
                return (
                  <Button
                    key={rate}
                    label={SPEECH_RATE_LABELS[rate]}
                    variant={selected ? "primary" : "soft"}
                    onPress={() => chooseRate(rate)}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={guideOpen} transparent animationType="fade" onRequestClose={() => setGuideOpen(false)}>
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityLabel="Fechar guia"
            onPress={() => setGuideOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <View
            className="rounded-t-[28px] bg-white px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-neutral" />
            <Text className="mb-4 text-center font-quicksand text-3xl text-dark">Guia de início</Text>
            <View className="gap-3">
              {GUIDE_STEPS.map((step, index) => (
                <View key={step} className="flex-row gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-wash">
                    <Text className="font-quicksand text-xl text-primary">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 font-quicksand text-xl text-dark">{step}</Text>
                </View>
              ))}
              <Button label="Entendi" className="mt-2" onPress={() => setGuideOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={suggestionOpen} animationType="slide" onRequestClose={() => setSuggestionOpen(false)}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            className="flex-row items-center justify-between border-b border-line px-4 pb-3"
            style={{ paddingTop: insets.top + 12 }}
          >
            <IconButton
              icon="close"
              accessibilityLabel="Fechar"
              onPress={() => setSuggestionOpen(false)}
            />
            <Text className="font-quicksand text-3xl text-dark">Sugestão</Text>
            <View className="w-10" />
          </View>
          <View className="gap-4 px-5 pt-5">
            {suggestionSent ? (
              <Text className="font-quicksand text-2xl text-dark">
                Sugestão guardada neste aparelho. Obrigado por ajudar o Sonora.
              </Text>
            ) : (
              <>
                <Text className="font-quicksand text-xl text-neutral-dark">
                  Conte o que facilitaria o dia de quem usa o app.
                </Text>
                <TextInput
                  value={suggestion}
                  onChangeText={setSuggestion}
                  placeholder="Escreva aqui"
                  placeholderTextColor={colors.neutralDark}
                  multiline
                  className="min-h-[140px] rounded-2xl border border-neutral bg-neutral-light px-4 py-3 text-dark"
                  style={{ fontSize: 18, textAlignVertical: "top" }}
                />
                <Button label="Guardar sugestão" onPress={sendSuggestion} />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
