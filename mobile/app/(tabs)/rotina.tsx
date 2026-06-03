import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { RoutinePecCard } from "@/components/PecCard";
import { colors } from "@/constants/colors";
import { ROUTINE_BLOCKS } from "@/constants/phrases";

const DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const FULL_DAYS = [
  "DOMINGO",
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SÁBADO",
];

export default function RotinaScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today);

  const handleSelectDay = useCallback((idx: number) => {
    setSelectedDay(idx);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

  return (
    <View style={styles.container}>
      <View style={styles.daysBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContent}
        >
          {DAYS.map((day, idx) => {
            const isActive = idx === selectedDay;
            return (
              <Pressable
                key={day}
                onPress={() => handleSelectDay(idx)}
                style={[
                  styles.dayChip,
                  isActive && styles.dayChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isActive && styles.dayLabelActive,
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 16 },
        ]}
      >
        {ROUTINE_BLOCKS.map((block) => (
          <View key={block.time} style={styles.timeBlock}>
            <View style={styles.blockHeader}>
              <View style={styles.timeTag}>
                <Text style={styles.timeText}>{block.time}</Text>
              </View>
              <Text style={styles.blockLabel}>{block.label}</Text>
              <Pressable
                onPress={() => Speech.speak(block.label, { language: "pt-BR" })}
                style={styles.speakBtn}
              >
                <Ionicons name="volume-high" size={18} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.pecGrid}>
              {block.items.map((item, itemIdx) => (
                <View key={item.id} style={styles.pecWrapper}>
                  <RoutinePecCard
                    id={item.id}
                    title={item.title}
                    color={item.color}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  daysBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  daysContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    flexDirection: "row",
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: "#F5F5F5",
  },
  dayChipActive: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayLabel: {
    fontFamily: "Dongle-Bold",
    fontSize: 15,
    color: colors.neutralDark,
    letterSpacing: 0.3,
  },
  dayLabelActive: {
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 16,
  },
  timeBlock: {
    gap: 10,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeTag: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeText: {
    fontFamily: "Dongle-Bold",
    fontSize: 18,
    color: "#fff",
    lineHeight: 20,
  },
  blockLabel: {
    fontFamily: "Dongle-Bold",
    fontSize: 20,
    color: colors.dark,
    flex: 1,
    letterSpacing: 0.5,
  },
  speakBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  pecGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pecWrapper: {
    width: "50%",
  },
});
