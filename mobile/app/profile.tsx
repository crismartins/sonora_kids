import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";

const AVATAR = require("../assets/images/avatar_default_v1.png");
const AVATAR_2 = require("../assets/images/avatar_default_v2.png");

const MOST_USED = [
  { count: 47, text: "BRINCAR", color: "purple" },
  { count: 40, text: "CELULAR", color: "blue" },
  { count: 38, text: "ESCOVAR OS DENTES", color: "teal" },
  { count: 26, text: "DORMIR", color: "indigo" },
  { count: 17, text: "DOR", color: "pink" },
  { count: 12, text: "ESCOLA", color: "orange" },
  { count: 12, text: "DESENHO", color: "greenAccent" },
  { count: 3, text: "JOGAR", color: "cyan" },
  { count: 2, text: "COMER", color: "orange" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: "#FFFFFF" }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarRow}>
        <View style={styles.avatarOption}>
          <View style={[styles.avatarFrame, styles.avatarFrameGrey]}>
            <Ionicons name="camera-outline" size={28} color={colors.neutralDark} />
          </View>
        </View>
        <View style={[styles.avatarOption, styles.avatarOptionActive]}>
          <Image source={AVATAR} style={styles.avatarImg} />
        </View>
        <View style={styles.avatarOption}>
          <Image source={AVATAR_2} style={styles.avatarImgSmall} />
        </View>
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.nickname}>Joãozinho</Text>
        <Text style={styles.fullname}>João Roberto Pereira da Silva</Text>
      </View>

      <View style={styles.wordsCard}>
        <Text style={styles.wordsTitle}>Palavras mais usadas</Text>
        <View style={styles.wordsGrid}>
          {MOST_USED.map((word, idx) => (
            <View
              key={idx}
              style={[
                styles.wordChip,
                { backgroundColor: getCategoryBgColor(word.color) },
              ]}
            >
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{word.count}</Text>
              </View>
              <Text
                style={[
                  styles.wordText,
                  { color: getCategoryColor(word.color) },
                ]}
              >
                {word.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.editBtn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons name="pencil-outline" size={18} color="#fff" />
        <Text style={styles.editBtnText}>Editar Perfil</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
    alignItems: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    justifyContent: "center",
  },
  avatarOption: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOptionActive: {
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 22,
  },
  avatarFrame: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFrameGrey: {
    backgroundColor: "#F5F5F5",
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  avatarImgSmall: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  nameSection: {
    alignItems: "center",
    gap: 4,
  },
  nickname: {
    fontFamily: "Dongle-Bold",
    fontSize: 40,
    color: colors.primary,
    lineHeight: 42,
  },
  fullname: {
    fontFamily: "Dongle-Regular",
    fontSize: 20,
    color: colors.neutralDark,
    textAlign: "center",
  },
  wordsCard: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  wordsTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 26,
    color: "#fff",
  },
  wordsGrid: {
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
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 26,
    alignItems: "center",
  },
  countText: {
    fontFamily: "Dongle-Bold",
    fontSize: 15,
    color: colors.dark,
    lineHeight: 17,
  },
  wordText: {
    fontFamily: "Dongle-Bold",
    fontSize: 16,
    lineHeight: 18,
  },
  editBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  editBtnText: {
    fontFamily: "Dongle-Bold",
    fontSize: 22,
    color: "#fff",
    lineHeight: 24,
  },
});
