import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

const AVATAR = require("../../assets/images/avatar_default_v1.png");

interface ActivityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tagColor: string;
  bgColor: string;
  tag: string;
  comingSoon?: boolean;
}

function ActivityCard({
  icon,
  title,
  description,
  tagColor,
  bgColor,
  tag,
  comingSoon,
}: ActivityCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.activityCard, pressed && { opacity: 0.9 }]}>
      <View style={[styles.activityIcon, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDesc}>{description}</Text>
      </View>
      <View style={[styles.activityTag, { backgroundColor: bgColor }]}>
        <Text style={[styles.activityTagText, { color: tagColor }]}>
          {comingSoon ? "Em breve" : tag}
        </Text>
      </View>
    </Pressable>
  );
}

export default function AprenderScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: tabBarHeight + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.heroBanner}>
        <View style={styles.heroLeft}>
          <MaterialIcons name="sports-esports" size={40} color="#fff" />
          <Text style={styles.heroTitle}>APRENDA{"\n"}JOGANDO</Text>
        </View>
        <View style={styles.heroRight}>
          <Image source={AVATAR} style={styles.heroAvatar} />
        </View>
      </Pressable>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Atividades</Text>
        <View style={styles.activitiesInner}>
          <ActivityCard
            icon={<MaterialCommunityIcons name="cards-outline" size={26} color={colors.primary} />}
            title="Memória com PECS"
            description="Encontre os pares de palavras"
            tag="Jogo"
            bgColor="#E3F2FD"
            tagColor={colors.primary}
            comingSoon
          />
          <View style={styles.divider} />
          <ActivityCard
            icon={<Ionicons name="mic-outline" size={26} color="#00897B" />}
            title="Repita Comigo"
            description="Pratique pronunciar palavras"
            tag="Fala"
            bgColor="#E0F2F1"
            tagColor="#00897B"
            comingSoon
          />
          <View style={styles.divider} />
          <ActivityCard
            icon={<MaterialCommunityIcons name="puzzle-outline" size={26} color="#6A1B9A" />}
            title="Monte a Frase"
            description="Arraste ícones e forme frases"
            tag="Atividade"
            bgColor="#EDE7F6"
            tagColor="#6A1B9A"
            comingSoon
          />
          <View style={styles.divider} />
          <ActivityCard
            icon={<Ionicons name="book-outline" size={26} color="#EF6C00" />}
            title="História do Dia"
            description="Histórias com imagens PECS"
            tag="Leitura"
            bgColor="#FBE9E7"
            tagColor="#EF6C00"
            comingSoon
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  heroBanner: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 140,
  },
  heroLeft: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 36,
    color: "#fff",
    lineHeight: 36,
  },
  heroRight: {},
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  sectionCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 22,
    color: colors.neutralDark,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  activitiesInner: {},
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 21,
    color: colors.dark,
    lineHeight: 23,
  },
  activityDesc: {
    fontFamily: "Dongle-Regular",
    fontSize: 16,
    color: colors.neutralDark,
    lineHeight: 18,
  },
  activityTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  activityTagText: {
    fontFamily: "Dongle-Bold",
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
});
