import React from "react";
import { View, Text, ScrollView, Pressable, Switch, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

interface RowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (val: boolean) => void;
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
  destructive,
  isLast,
}: RowProps) {
  return (
    <Pressable
      className={`flex-row items-center gap-3 bg-white px-3.5 py-[13px] ${
        !isLast ? "border-b border-[#F5F5F5]" : ""
      } ${!toggle ? "active:bg-[#FAFAFA]" : ""}`}
    >
      <View
        className="h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: destructive ? "#FFEBEE" : "#F0F8FF" }}
      >
        {icon}
      </View>
      <View className="flex-1 gap-px">
        <Text
          className={`font-dongle-bold text-xl leading-[22px] ${
            destructive ? "text-[#D32F2F]" : "text-dark"
          }`}
        >
          {label}
        </Text>
        {description ? (
          <Text className="font-dongle text-[15px] leading-[17px] text-neutral-dark">
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
        <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
      )}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-1">
      <Text className="px-5 pb-[5px] pt-[18px] font-dongle-bold text-[17px] uppercase tracking-wide text-neutral-dark">
        {title}
      </Text>
      <View className="mx-4 overflow-hidden rounded-2xl border border-[#F0F0F0] bg-white">
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [haptics, setHaptics] = React.useState(true);
  const [autoSpeak, setAutoSpeak] = React.useState(false);
  const [largeText, setLargeText] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);

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
          icon={<MaterialIcons name="flag" size={20} color={colors.primary} />}
          label="Guia de início"
          description="Configure o app pela primeira vez"
          isLast
        />
      </Section>

      <Section title="Comunicação">
        <Row
          icon={<Ionicons name="mic-outline" size={20} color={colors.primary} />}
          label="Idioma da voz"
          description="Português (Brasil)"
        />
        <Row
          icon={<Ionicons name="volume-high-outline" size={20} color={colors.primary} />}
          label="Falar automaticamente"
          description="Fala ao selecionar categoria"
          toggle
          value={autoSpeak}
          onToggle={setAutoSpeak}
        />
        <Row
          icon={<MaterialCommunityIcons name="speedometer" size={20} color={colors.primary} />}
          label="Velocidade da fala"
          description="Normal"
          isLast
        />
      </Section>

      <Section title="Acessibilidade">
        <Row
          icon={<MaterialIcons name="vibration" size={20} color="#00897B" />}
          label="Vibração (haptics)"
          toggle
          value={haptics}
          onToggle={setHaptics}
        />
        <Row
          icon={<MaterialIcons name="text-fields" size={20} color="#00897B" />}
          label="Texto grande"
          toggle
          value={largeText}
          onToggle={setLargeText}
        />
        <Row
          icon={<Ionicons name="contrast-outline" size={20} color="#00897B" />}
          label="Alto contraste"
          toggle
          value={highContrast}
          onToggle={setHighContrast}
          isLast
        />
      </Section>

      <Section title="Conectar">
        <Row
          icon={<Ionicons name="mic-circle-outline" size={20} color="#6A1B9A" />}
          label="Conecta à Alexa"
          description="Integrar com Amazon Alexa"
        />
        <Row
          icon={<Ionicons name="chatbubble-outline" size={20} color="#6A1B9A" />}
          label="Envie-nos Sugestões"
          description="Nos ajude a melhorar o app"
          isLast
        />
      </Section>

      <Section title="Conta">
        <Row
          icon={<Ionicons name="person-outline" size={20} color={colors.neutralDark} />}
          label="Editar perfil"
        />
        <Row
          icon={<Ionicons name="cloud-download-outline" size={20} color={colors.neutralDark} />}
          label="Sincronizar dados"
          description="Último sync: hoje"
        />
        <Row
          icon={<Ionicons name="trash-outline" size={20} color="#D32F2F" />}
          label="Redefinir configurações"
          destructive
          isLast
        />
      </Section>

      <Text className="mb-1 mt-3 text-center font-dongle text-base text-[#BDBDBD]">
        App Versão 1.0
      </Text>
    </ScrollView>
  );
}
