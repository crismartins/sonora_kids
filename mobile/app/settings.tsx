import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  destructive?: boolean;
}

function SettingRow({
  icon,
  label,
  description,
  toggle,
  value,
  onToggle,
  destructive,
}: SettingRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && !toggle && { backgroundColor: colors.neutral },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${colors.neutral}` }]}>
        {icon}
      </View>
      <View style={styles.rowContent}>
        <Text
          style={[styles.rowLabel, destructive && { color: "#D32F2F" }]}
        >
          {label}
        </Text>
        {description && (
          <Text style={styles.rowDesc}>{description}</Text>
        )}
      </View>
      {toggle && onToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.neutral, true: `${colors.primary}66` }}
          thumbColor={value ? colors.primary : colors.neutralDark}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.neutralDark}
        />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [haptics, setHaptics] = React.useState(true);
  const [autoSpeak, setAutoSpeak] = React.useState(false);
  const [largeText, setLargeText] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.neutralLight }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 32 },
      ]}
    >
      <SectionHeader title="Comunicação" />
      <View style={styles.group}>
        <SettingRow
          icon={<Ionicons name="mic-outline" size={20} color={colors.primary} />}
          label="Idioma da voz"
          description="Português (Brasil)"
        />
        <SettingRow
          icon={<Ionicons name="volume-high-outline" size={20} color={colors.primary} />}
          label="Falar automaticamente"
          description="Fala ao selecionar uma categoria"
          toggle
          value={autoSpeak}
          onToggle={setAutoSpeak}
        />
        <SettingRow
          icon={<MaterialCommunityIcons name="speedometer" size={20} color={colors.primary} />}
          label="Velocidade da fala"
          description="Normal"
        />
      </View>

      <SectionHeader title="Acessibilidade" />
      <View style={styles.group}>
        <SettingRow
          icon={<MaterialIcons name="vibration" size={20} color="#00897B" />}
          label="Vibração (haptics)"
          toggle
          value={haptics}
          onToggle={setHaptics}
        />
        <SettingRow
          icon={<MaterialIcons name="text-fields" size={20} color="#00897B" />}
          label="Texto grande"
          toggle
          value={largeText}
          onToggle={setLargeText}
        />
        <SettingRow
          icon={<Ionicons name="contrast-outline" size={20} color="#00897B" />}
          label="Alto contraste"
          toggle
          value={highContrast}
          onToggle={setHighContrast}
        />
      </View>

      <SectionHeader title="Conta" />
      <View style={styles.group}>
        <SettingRow
          icon={<Ionicons name="person-outline" size={20} color="#6A1B9A" />}
          label="Editar perfil"
        />
        <SettingRow
          icon={<Ionicons name="cloud-download-outline" size={20} color="#6A1B9A" />}
          label="Sincronizar dados"
          description="Último sync: hoje"
        />
      </View>

      <SectionHeader title="Sobre" />
      <View style={styles.group}>
        <SettingRow
          icon={<Ionicons name="information-circle-outline" size={20} color={colors.neutralDark} />}
          label="Versão do app"
          description="1.0.0"
        />
        <SettingRow
          icon={<Ionicons name="document-text-outline" size={20} color={colors.neutralDark} />}
          label="Termos de uso"
        />
        <SettingRow
          icon={<Ionicons name="trash-outline" size={20} color="#D32F2F" />}
          label="Redefinir configurações"
          destructive
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: 8,
  },
  sectionHeader: {
    fontFamily: "Dongle-Bold",
    fontSize: 18,
    color: colors.neutralDark,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    textTransform: "uppercase",
  },
  group: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    gap: 1,
  },
  rowLabel: {
    fontFamily: "Dongle-Bold",
    fontSize: 20,
    color: colors.dark,
    lineHeight: 22,
  },
  rowDesc: {
    fontFamily: "Dongle-Regular",
    fontSize: 15,
    color: colors.neutralDark,
    lineHeight: 17,
  },
});
