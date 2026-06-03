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

function Row({ icon, label, description, toggle, value, onToggle, destructive, isLast }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && !toggle && { backgroundColor: "#FAFAFA" },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: destructive ? "#FFEBEE" : "#F0F8FF" }]}>
        {icon}
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && { color: "#D32F2F" }]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.rowDesc}>{description}</Text>
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
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
      style={[styles.container, { backgroundColor: "#FFFFFF" }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom:
            (Platform.OS === "web" ? 34 : insets.bottom) + 32,
        },
      ]}
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

      <Text style={styles.version}>App Versão 1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: 8,
    gap: 0,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 17,
    color: colors.neutralDark,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 5,
    textTransform: "uppercase",
  },
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
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
  version: {
    fontFamily: "Dongle-Regular",
    fontSize: 16,
    color: "#BDBDBD",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
});
