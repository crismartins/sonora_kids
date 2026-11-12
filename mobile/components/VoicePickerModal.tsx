import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { SolarIcon, SolarIconName } from "@/components/SolarIcon";
import { ScreenModal } from "@/components/AppModal";
import { PillText } from "@/components/PillText";
import { Voice } from "expo-speech";
import { colors } from "@/constants/colors";
import { useI18n } from "@/i18n";
import {
  inferVoiceGender,
  listSpeakableVoices,
  resolveSpeech,
  SpeechLanguage,
  SpeechRate,
  voicePreview,
  VoiceGender,
} from "@/services/appSettings";

interface VoicePickerModalProps {
  visible: boolean;
  voices: Voice[];
  gender: VoiceGender;
  voiceId: string | null;
  language: SpeechLanguage;
  speechRate: SpeechRate;
  onClose: () => void;
  onSelectGender: (gender: VoiceGender) => void;
  onSelectVoice: (voice: Voice) => void;
  onSelectLanguage: (language: SpeechLanguage) => void;
  onSelectRate: (rate: SpeechRate) => void;
}

const LANGUAGES: SpeechLanguage[] = ["pt-BR", "pt-PT", "en", "es"];

function LanguageFlag({ language }: { language: SpeechLanguage }) {
  const clipId = `flag-${language}`;
  return (
    <Svg width={24} height={16} viewBox="0 0 24 16">
      <Defs>
        <ClipPath id={clipId}>
          <Rect width="24" height="16" rx="3" />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        {language === "pt-BR" ? (
          <>
            <Rect width="24" height="16" fill="#009C3B" />
            <Path d="M12 2.2 L21.2 8 L12 13.8 L2.8 8 Z" fill="#FFDF00" />
            <Circle cx="12" cy="8" r="3" fill="#002776" />
          </>
        ) : null}
        {language === "pt-PT" ? (
          <>
            <Rect width="24" height="16" fill="#FF0000" />
            <Rect width="9.2" height="16" fill="#006600" />
            <Circle cx="9.2" cy="8" r="3.1" fill="#FFD500" />
          </>
        ) : null}
        {language === "en" ? (
          <>
            {[0, 1, 2, 3, 4, 5, 6].map((stripe) => (
              <Rect
                key={stripe}
                y={(stripe * 16) / 7}
                width="24"
                height={16 / 7 + 0.2}
                fill={stripe % 2 === 0 ? "#BF0A30" : "#FFFFFF"}
              />
            ))}
            <Rect width="10" height={(16 / 7) * 4} fill="#002868" />
          </>
        ) : null}
        {language === "es" ? (
          <>
            <Rect width="24" height="16" fill="#F1BF00" />
            <Rect width="24" height="4" fill="#AA151B" />
            <Rect y="12" width="24" height="4" fill="#AA151B" />
          </>
        ) : null}
      </G>
    </Svg>
  );
}

const TONE_OPTIONS: { gender: VoiceGender; icon: SolarIconName }[] = [
  { gender: "feminine", icon: "women" },
  { gender: "masculine", icon: "men" },
];

const RATE_LEVELS: { rate: SpeechRate; color: string; labelColor: string }[] = [
  { rate: "slow", color: "#3DDC84", labelColor: "#178A45" },
  { rate: "normal", color: "#F5C518", labelColor: "#A67C00" },
  { rate: "fast", color: "#F04438", labelColor: "#D32F2F" },
];

const TRACK_HEIGHT = 16;
const THUMB_SIZE = 30;
const SLIDER_HEIGHT = 44;

function stopCenter(index: number, width: number) {
  const inset = THUMB_SIZE / 2;
  if (width <= THUMB_SIZE) return inset;
  return inset + (index / (RATE_LEVELS.length - 1)) * (width - THUMB_SIZE);
}

function SpeechRateSlider({ value, onChange }: { value: SpeechRate; onChange: (rate: SpeechRate) => void }) {
  const copy = useI18n();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, RATE_LEVELS.findIndex((level) => level.rate === value));
  const active = RATE_LEVELS[index];

  const selectAt = (x: number) => {
    if (width <= THUMB_SIZE) return;
    const span = width - THUMB_SIZE;
    const ratio = Math.min(1, Math.max(0, (x - THUMB_SIZE / 2) / span));
    const next = RATE_LEVELS[Math.round(ratio * (RATE_LEVELS.length - 1))];
    if (next.rate !== value) onChange(next.rate);
  };

  const step = (direction: 1 | -1) => {
    const next = RATE_LEVELS[index + direction];
    if (next) onChange(next.rate);
  };

  return (
    <View className="gap-1 px-5">
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={copy.voice.rate}
        accessibilityValue={{ text: copy.voice.rates[value] }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") step(1);
          if (event.nativeEvent.actionName === "decrement") step(-1);
        }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(event) => selectAt(event.nativeEvent.locationX)}
        onResponderMove={(event) => selectAt(event.nativeEvent.locationX)}
        style={{ height: SLIDER_HEIGHT, justifyContent: "center" }}
      >
        <View
          pointerEvents="none"
          style={{ height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, overflow: "hidden" }}
        >
          {width > 0 ? (
            <Svg width={width} height={TRACK_HEIGHT}>
              <Defs>
                <LinearGradient id="speech-rate" x1="0" y1="0" x2="1" y2="0">
                  {RATE_LEVELS.map((level, stop) => (
                    <Stop
                      key={level.rate}
                      offset={stop / (RATE_LEVELS.length - 1)}
                      stopColor={level.color}
                    />
                  ))}
                </LinearGradient>
              </Defs>
              <Rect width={width} height={TRACK_HEIGHT} rx={TRACK_HEIGHT / 2} fill="url(#speech-rate)" />
            </Svg>
          ) : null}
        </View>
        {width > 0
          ? RATE_LEVELS.map((level, stop) => (
              <View
                key={level.rate}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: stopCenter(stop, width) - 4,
                  top: (SLIDER_HEIGHT - 8) / 2,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.white,
                  opacity: stop === index ? 0 : 0.85,
                }}
              />
            ))
          : null}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: width > 0 ? stopCenter(index, width) - THUMB_SIZE / 2 : 0,
            top: (SLIDER_HEIGHT - THUMB_SIZE) / 2,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: colors.white,
            borderWidth: 4,
            borderColor: active.color,
            shadowColor: colors.dark,
            shadowOpacity: 0.22,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          }}
        />
      </View>
      <View className="flex-row">
        {RATE_LEVELS.map((level, stop) => {
          const selected = level.rate === value;
          const align = stop === 0 ? "left" : stop === RATE_LEVELS.length - 1 ? "right" : "center";
          return (
            <Pressable
              key={level.rate}
              accessibilityLabel={copy.voice.rates[level.rate]}
              accessibilityState={{ selected }}
              onPress={() => onChange(level.rate)}
              className="flex-1 py-1"
            >
              <Text
                className="font-quicksand text-lg"
                style={{ textAlign: align, color: selected ? level.labelColor : colors.neutralDark }}
              >
                {copy.voice.rates[level.rate]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function VoicePickerModal({
  visible,
  voices,
  gender,
  voiceId,
  language,
  speechRate,
  onClose,
  onSelectGender,
  onSelectVoice,
  onSelectLanguage,
  onSelectRate,
}: VoicePickerModalProps) {
  const insets = useSafeAreaInsets();
  const copy = useI18n();
  const options = listSpeakableVoices(voices, language, gender);
  const activeVoiceId = resolveSpeech(voices, { voiceId, voiceGender: gender, language }).voice;
  const hasPortugal = voices.some((voice) => voice.language.toLowerCase().replace(/_/g, "-").startsWith("pt-pt"));
  const languages = LANGUAGES.filter((code) => code !== "pt-PT" || hasPortugal);
  const languageName = copy.voice.languageNames[language];

  return (
    <ScreenModal visible={visible} title={copy.voice.title} onClose={onClose}>
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: insets.bottom + 32,
          gap: 18,
        }}
      >
        <View className="gap-2">
          <Text className="px-5 font-quicksand text-xl text-dark">{copy.voice.language}</Text>
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            {languages.map((code) => {
              const selected = language === code;
              return (
                <Pressable
                  key={code}
                  accessibilityLabel={copy.voice.languages[code]}
                  accessibilityState={{ selected }}
                  onPress={() => onSelectLanguage(code)}
                  className={`h-12 flex-row items-center justify-center gap-2 rounded-full px-4 ${
                    selected ? "bg-primary-wash" : "bg-muted"
                  }`}
                >
                  <LanguageFlag language={code} />
                  <Text
                    numberOfLines={1}
                    className={`font-quicksand text-lg ${selected ? "text-primary" : "text-neutral-dark"}`}
                  >
                    {copy.voice.languages[code]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="gap-2 px-5">
          <Text className="font-quicksand text-xl text-dark">{copy.voice.tone}</Text>
          <View className="flex-row overflow-hidden rounded-full bg-white">
            {TONE_OPTIONS.map(({ gender: option, icon }) => {
              const selected = gender === option;
              const tint = selected ? colors.primary : colors.neutralDark;
              return (
                <Pressable
                  key={option}
                  accessibilityLabel={copy.voice[option === "feminine" ? "feminine" : "masculine"]}
                  accessibilityState={{ selected }}
                  onPress={() => onSelectGender(option)}
                  className={`flex-1 items-center justify-center gap-0 rounded-full py-3 ${selected ? "bg-primary-soft" : ""}`}
                >
                  <SolarIcon name={icon} size={24} color={tint} />
                  <PillText size={16} style={{ color: tint }}>
                    {copy.voice[option === "feminine" ? "feminine" : "masculine"]}
                  </PillText>
                </Pressable>
              );
            })}
          </View>
          <Text className="font-quicksand text-lg text-neutral-dark">{copy.voice.tapToHear(voicePreview(language))}</Text>
        </View>

        <View className="gap-2">
          <Text className="px-5 font-quicksand text-xl text-dark">{copy.voice.rate}</Text>
          <SpeechRateSlider value={speechRate} onChange={onSelectRate} />
        </View>

        <View className="gap-2 px-5">
          <Text className="font-quicksand text-xl text-dark">{copy.voice.deviceVoices}</Text>
          {options.length === 0 ? (
            <Text className="font-quicksand text-lg text-neutral-dark">
              {copy.voice.none(copy.voice[gender].toLowerCase(), languageName)}
            </Text>
          ) : (
            options.map((voice) => {
              const inferred = inferVoiceGender(voice);
              const selected = voice.identifier === activeVoiceId;
              return (
                <Pressable
                  key={voice.identifier}
                  accessibilityLabel={voice.name}
                  onPress={() => onSelectVoice(voice)}
                  className={`flex-row items-center gap-3 rounded-2xl border px-3.5 py-3 ${
                    selected ? "border-primary bg-primary-wash" : "border-line bg-white"
                  }`}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                    <SolarIcon name="volume-loud" size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand text-xl text-dark">{voice.name}</Text>
                    <Text className="font-quicksand text-base text-neutral-dark">
                      {inferred ? copy.voice[inferred === "feminine" ? "feminine" : "masculine"] : copy.voice.adjustable} · {voice.language}
                    </Text>
                  </View>
                  {selected ? <SolarIcon name="check-circle" size={22} color={colors.primary} /> : null}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenModal>
  );
}

