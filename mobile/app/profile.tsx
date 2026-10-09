import React from "react";
import { View, Text, Image, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";

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
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 32,
        gap: 20,
        alignItems: "center",
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-end justify-center gap-3">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F5]">
          <Ionicons name="camera-outline" size={28} color={colors.neutralDark} />
        </View>
        <View className="overflow-hidden rounded-[22px] border-[3px] border-primary">
          <Image source={AVATAR} className="h-[88px] w-[88px] rounded-[20px]" />
        </View>
        <Image source={AVATAR_2} className="h-16 w-16 rounded-2xl" />
      </View>

      <View className="items-center gap-1">
        <Text className="font-dongle-bold text-[40px] leading-[42px] text-primary">
          Joãozinho
        </Text>
        <Text className="text-center font-dongle text-xl text-neutral-dark">
          João Roberto Pereira da Silva
        </Text>
      </View>

      <View className="w-full gap-3.5 rounded-3xl bg-primary p-5">
        <Text className="font-dongle-bold text-[26px] text-white">Palavras mais usadas</Text>
        <View className="flex-row flex-wrap gap-2">
          {MOST_USED.map((word, idx) => (
            <View
              key={idx}
              className="h-8 flex-row items-center gap-1.5 rounded-full px-2.5"
              style={{ backgroundColor: getCategoryBgColor(word.color) }}
            >
              <View className="h-5 min-w-[26px] items-center justify-center rounded-full bg-white/85 px-1.5">
                <PillText size={14} style={{ color: "#001D4A" }}>
                  {word.count}
                </PillText>
              </View>
              <PillText size={15} style={{ color: getCategoryColor(word.color) }}>
                {word.text}
              </PillText>
            </View>
          ))}
        </View>
      </View>

      <Pressable className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 active:opacity-85">
        <Ionicons name="pencil-outline" size={18} color="#fff" />
        <Text className="font-dongle-bold text-[22px] leading-6 text-white">Editar Perfil</Text>
      </Pressable>
    </ScrollView>
  );
}
