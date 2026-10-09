import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { RoutinePecCard } from "@/components/PecCard";
import { PillText } from "@/components/PillText";
import { colors } from "@/constants/colors";
import { ROUTINE_BLOCKS } from "@/constants/phrases";

const DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

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
    <View className="flex-1 bg-white">
      <View className="border-b border-[#F0F0F0] bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
            flexDirection: "row",
          }}
        >
          {DAYS.map((day, idx) => {
            const isActive = idx === selectedDay;
            return (
              <Pressable
                key={day}
                onPress={() => handleSelectDay(idx)}
                className={`h-10 items-center justify-center rounded-full border-[1.5px] px-3.5 ${
                  isActive
                    ? "border-primary bg-[#E3F2FD]"
                    : "border-transparent bg-[#F5F5F5]"
                }`}
              >
                <PillText
                  size={16}
                  style={{
                    color: isActive ? colors.primary : colors.neutralDark,
                    letterSpacing: 0.4,
                  }}
                >
                  {day}
                </PillText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: tabBarHeight + 16,
          gap: 16,
        }}
      >
        {ROUTINE_BLOCKS.map((block) => (
          <View key={block.time} className="gap-2.5">
            <View className="flex-row items-center gap-2">
              <View className="h-8 items-center justify-center rounded-full bg-primary px-3">
                <PillText size={16} style={{ color: "#FFFFFF" }}>
                  {block.time}
                </PillText>
              </View>
              <Text className="flex-1 font-dongle-bold text-xl tracking-wide text-dark">
                {block.label}
              </Text>
              <Pressable
                onPress={() => Speech.speak(block.label, { language: "pt-BR" })}
                className="h-8 w-8 items-center justify-center rounded-full bg-[#E3F2FD]"
              >
                <Ionicons name="volume-high" size={18} color={colors.primary} />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap">
              {block.items.map((item) => (
                <View key={item.id} className="w-1/2">
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
