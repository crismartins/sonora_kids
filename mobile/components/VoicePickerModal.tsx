import React from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SolarIcon } from "@/components/SolarIcon";
import { Button, IconButton } from "@/components/Button";
import { Voice } from "expo-speech";
import { colors } from "@/constants/colors";
import {
  genderLabel,
  inferVoiceGender,
  listSpeakableVoices,
  SpeechLanguage,
  VoiceGender,
} from "@/services/appSettings";

interface VoicePickerModalProps {
  visible: boolean;
  voices: Voice[];
  gender: VoiceGender;
  voiceId: string | null;
  language: SpeechLanguage;
  onClose: () => void;
  onSelectGender: (gender: VoiceGender) => void;
  onSelectVoice: (voice: Voice) => void;
  onSelectLanguage: (language: SpeechLanguage) => void;
}

const PREVIEW = "Olá. Eu quero brincar.";

export function VoicePickerModal({
  visible,
  voices,
  gender,
  voiceId,
  language,
  onClose,
  onSelectGender,
  onSelectVoice,
  onSelectLanguage,
}: VoicePickerModalProps) {
  const insets = useSafeAreaInsets();
  const options = listSpeakableVoices(voices, language);
  const hasPortugal = voices.some((voice) =>
    voice.language.toLowerCase().replace(/_/g, "-").startsWith("pt-pt"),
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View
          className="flex-row items-center justify-between border-b border-line px-4 pb-3"
          style={{ paddingTop: insets.top + 12 }}
        >
          <IconButton icon="close" accessibilityLabel="Fechar" onPress={onClose} />
          <Text className="font-quicksand text-3xl text-dark">Voz</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 32,
            gap: 18,
          }}
        >
          <View className="gap-2">
            <Text className="font-quicksand text-xl text-dark">Tom</Text>
            <View className="flex-row gap-2">
              {(["feminine", "masculine"] as const).map((option) => {
                const selected = !voiceId && gender === option;
                return (
                  <Button
                    key={option}
                    label={genderLabel(option)}
                    variant={selected ? "primary" : "soft"}
                    accessibilityLabel={genderLabel(option)}
                    className="flex-1"
                    onPress={() => onSelectGender(option)}
                  />
                );
              })}
            </View>
            <Text className="font-quicksand text-lg text-neutral-dark">
              Toque para ouvir. “{PREVIEW}”
            </Text>
          </View>

          {hasPortugal ? (
            <View className="gap-2">
              <Text className="font-quicksand text-xl text-dark">Idioma</Text>
              <View className="flex-row gap-2">
                {(
                  [
                    ["pt-BR", "Português (Brasil)"],
                    ["pt-PT", "Português (Portugal)"],
                  ] as const
                ).map(([code, label]) => {
                  const selected = language === code;
                  return (
                    <Pressable
                      key={code}
                      onPress={() => onSelectLanguage(code)}
                      className={`h-12 flex-1 items-center justify-center rounded-full px-2 ${
                        selected ? "bg-primary-wash" : "bg-muted"
                      }`}
                    >
                      <Text
                        className={`font-quicksand text-lg ${selected ? "text-primary" : "text-neutral-dark"}`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View className="gap-2">
            <Text className="font-quicksand text-xl text-dark">Vozes neste aparelho</Text>
            {options.length === 0 ? (
              <Text className="font-quicksand text-lg text-neutral-dark">
                Nenhuma voz em português foi encontrada. Feminina e masculina mudam o tom da voz padrão.
              </Text>
            ) : (
              options.map((voice) => {
                const inferred = inferVoiceGender(voice);
                const selected = voice.identifier === voiceId;
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
                      <SolarIcon name="volume" size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand text-xl text-dark">{voice.name}</Text>
                      <Text className="font-quicksand text-base text-neutral-dark">
                        {inferred ? genderLabel(inferred) : "Tom ajustável"} · {voice.language}
                      </Text>
                    </View>
                    {selected ? (
                      <SolarIcon name="check-circle" size={22} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export const VOICE_PREVIEW = PREVIEW;
