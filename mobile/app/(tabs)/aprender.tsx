import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router, type Href } from "expo-router";
import { SolarIcon, SolarIconName } from "@/components/SolarIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { tabBarClearance } from "@/constants/tabBar";
import { PillText } from "@/components/PillText";

interface ActivityCardProps {
  href: Href;
  icon: SolarIconName;
  title: string;
  description: string;
  color: string;
  background: string;
  tag: string;
}

const ACTIVITIES: ActivityCardProps[] = [
  {
    href: "/atividade/memoria",
    icon: "gamepad",
    title: "Memória com PECS",
    description: "Encontre os pares de palavras",
    tag: "Jogo",
    color: colors.primary,
    background: colors.primaryWash,
  },
  {
    href: "/atividade/repita",
    icon: "microphone",
    title: "Repita Comigo",
    description: "Ouça e toque na palavra",
    tag: "Fala",
    color: getCategoryColor("greenAccent"),
    background: getCategoryBgColor("greenAccent"),
  },
  {
    href: "/atividade/frase",
    icon: "text-field",
    title: "Monte a Frase",
    description: "Ouça e toque as palavras na ordem",
    tag: "Frase",
    color: getCategoryColor("purple"),
    background: getCategoryBgColor("purple"),
  },
  {
    href: "/atividade/historia",
    icon: "book",
    title: "História do Dia",
    description: "Ouça o conto e passe a página",
    tag: "Leitura",
    color: getCategoryColor("orange"),
    background: getCategoryBgColor("orange"),
  },
];

function ActivityCard({ href, icon, title, description, color, background, tag }: ActivityCardProps) {
  return (
    <Pressable
      accessibilityLabel={title}
      onPress={() => router.push(href)}
      className="flex-row items-center gap-3 py-3 active:opacity-90"
    >
      <View
        className="h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: background }}
      >
        <SolarIcon name={icon} size={26} color={color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-quicksand text-[22px] text-dark">{title}</Text>
        <Text className="font-quicksand text-base text-neutral-dark">{description}</Text>
      </View>
      <View className="h-7 items-center justify-center rounded-full px-2.5" style={{ backgroundColor: background }}>
        <PillText size={14} style={{ color }}>
          {tag}
        </PillText>
      </View>
    </Pressable>
  );
}

export default function AprenderScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = tabBarClearance(insets.bottom);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: tabBarHeight + 24,
        gap: 14,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="rounded-[22px] border border-line bg-canvas p-4">
        {ACTIVITIES.map((activity, index) => (
          <View key={activity.title}>
            {index > 0 ? <View className="h-px bg-line" /> : null}
            <ActivityCard {...activity} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
