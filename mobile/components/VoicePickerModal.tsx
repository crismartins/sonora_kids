import React from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
          className="flex-row items-center justify-between border-b border-[#F0F0F0] px-4 pb-3"
          style={{ paddingTop: insets.top + 12 }}
        >
          <Pressable
            accessibilityLabel="Fechar"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]"
          >
            <Ionicons name="close" size={22} color={colors.dark} />
          </Pressable>
          <Text className="font-dongle-bold text-3xl text-dark">Voz</Text>
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
            <Text className="font-dongle-bold text-xl text-dark">Tom</Text>
            <View className="flex-row gap-2">
              {(["feminine", "masculine"] as const).map((option) => {
                const selected = !voiceId && gender === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityLabel={genderLabel(option)}
                    onPress={() => onSelectGender(option)}
                    className={`h-14 flex-1 items-center justify-center rounded-full ${
                      selected ? "bg-primary" : "bg-[#F0F8FF]"
                    }`}
                  >
                    <Text
                      className={`font-dongle-bold text-2xl ${selected ? "text-white" : "text-primary"}`}
                    >
                      {genderLabel(option)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="font-dongle text-lg leading-5 text-neutral-dark">
              Toque para ouvir. “{PREVIEW}”
            </Text>
          </View>

          {hasPortugal ? (
            <View className="gap-2">
              <Text className="font-dongle-bold text-xl text-dark">Idioma</Text>
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
                        selected ? "bg-[#E3F2FD]" : "bg-[#F5F5F5]"
                      }`}
                    >
                      <Text
                        className={`font-dongle-bold text-lg ${selected ? "text-primary" : "text-neutral-dark"}`}
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
            <Text className="font-dongle-bold text-xl text-dark">Vozes neste aparelho</Text>
            {options.length === 0 ? (
              <Text className="font-dongle text-lg leading-5 text-neutral-dark">
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
                      selected ? "border-primary bg-[#E3F2FD]" : "border-[#F0F0F0] bg-white"
                    }`}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F0F8FF]">
                      <Ionicons name="volume-medium" size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-dongle-bold text-xl leading-6 text-dark">{voice.name}</Text>
                      <Text className="font-dongle text-base leading-4 text-neutral-dark">
                        {inferred ? genderLabel(inferred) : "Tom ajustável"} · {voice.language}
                      </Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
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
