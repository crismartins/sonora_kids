import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

interface ActivityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  gradient: string[];
}

function ActivityCard({ icon, title, description, tag, gradient }: ActivityCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: `${gradient[0]}22` }]}>
        {icon}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <View style={[styles.cardTag, { backgroundColor: `${gradient[0]}22` }]}>
        <Text style={[styles.cardTagText, { color: gradient[0] }]}>{tag}</Text>
      </View>
    </View>
  );
}

export default function AprenderScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "web" ? 34 + 68 : insets.bottom + 8 + 68;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.neutralLight }]}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
        <MaterialIcons name="school" size={36} color="#fff" />
        <Text style={styles.heroTitle}>Aprenda Jogando</Text>
        <Text style={styles.heroSubtitle}>
          Atividades lúdicas que reforçam a comunicação
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Em Breve</Text>

      <ActivityCard
        icon={<MaterialCommunityIcons name="cards-outline" size={28} color={colors.primary} />}
        title="Memória com PECS"
        description="Encontre os pares e aprenda novas palavras"
        tag="Jogo"
        gradient={[colors.primary, colors.primaryDark]}
      />
      <ActivityCard
        icon={<Ionicons name="mic-outline" size={28} color="#00897B" />}
        title="Repita Comigo"
        description="Pratique pronunciar palavras do seu vocabulário"
        tag="Fala"
        gradient={["#00897B", "#004D40"]}
      />
      <ActivityCard
        icon={<MaterialCommunityIcons name="puzzle-outline" size={28} color="#6A1B9A" />}
        title="Monte a Frase"
        description="Arraste os ícones e forme frases completas"
        tag="Atividade"
        gradient={["#6A1B9A", "#4527A0"]}
      />
      <ActivityCard
        icon={<Ionicons name="book-outline" size={28} color="#EF6C00" />}
        title="História do Dia"
        description="Leia histórias com imagens PECS ilustradas"
        tag="Leitura"
        gradient={["#EF6C00", "#BF360C"]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 36,
    color: "#fff",
    textAlign: "center",
  },
  heroSubtitle: {
    fontFamily: "Dongle-Regular",
    fontSize: 20,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 24,
    color: colors.neutralDark,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 22,
    color: colors.dark,
    lineHeight: 24,
  },
  cardDesc: {
    fontFamily: "Dongle-Regular",
    fontSize: 16,
    color: colors.neutralDark,
    lineHeight: 18,
  },
  cardTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    flexShrink: 0,
  },
  cardTagText: {
    fontFamily: "Dongle-Bold",
    fontSize: 14,
  },
});
