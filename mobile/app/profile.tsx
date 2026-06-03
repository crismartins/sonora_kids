import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";

const AVATAR = require("../assets/images/avatar_default_v1.png");

const MOST_USED = [
  { text: "Água", color: "cyan" },
  { text: "Comer", color: "orange" },
  { text: "Oi", color: "greenAccent" },
  { text: "Banheiro", color: "teal" },
  { text: "Brincar", color: "purple" },
  { text: "Dormir", color: "indigo" },
  { text: "Ajuda", color: "blue" },
  { text: "Obrigado", color: "greenAccent" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.neutralLight }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image source={AVATAR} style={styles.avatar} />
        </View>
        <Text style={styles.name}>Usuário</Text>
        <Text style={styles.fullName}>João Roberto Pereira da Silva</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.primary }]}>
        <Text style={styles.cardTitle}>Palavras mais usadas</Text>
        <View style={styles.chipsWrap}>
          {MOST_USED.map((word, idx) => (
            <View
              key={idx}
              style={[
                styles.wordChip,
                { backgroundColor: getCategoryBgColor(word.color) },
              ]}
            >
              <View style={styles.wordBadge}>
                <Text style={[styles.wordBadgeText, { color: colors.primary }]}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={[styles.wordText, { color: getCategoryColor(word.color) }]}>
                {word.text.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.neutral }]}>
          <Text style={styles.statNumber}>142</Text>
          <Text style={styles.statLabel}>Palavras usadas hoje</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.neutral }]}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Dias consecutivos</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  avatarSection: {
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.neutral,
    marginBottom: 4,
  },
  avatar: {
    width: 88,
    height: 88,
  },
  name: {
    fontFamily: "Dongle-Bold",
    fontSize: 32,
    color: colors.primary,
    lineHeight: 34,
  },
  fullName: {
    fontFamily: "Dongle-Regular",
    fontSize: 20,
    color: colors.neutralDark,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 28,
    color: "#fff",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  wordChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  wordBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.neutralLight}CC`,
    alignItems: "center",
    justifyContent: "center",
  },
  wordBadgeText: {
    fontFamily: "Dongle-Bold",
    fontSize: 16,
    lineHeight: 18,
  },
  wordText: {
    fontFamily: "Dongle-Bold",
    fontSize: 18,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontFamily: "Dongle-Bold",
    fontSize: 40,
    color: colors.primary,
    lineHeight: 42,
  },
  statLabel: {
    fontFamily: "Dongle-Regular",
    fontSize: 16,
    color: colors.neutralDark,
    textAlign: "center",
    lineHeight: 18,
  },
});
