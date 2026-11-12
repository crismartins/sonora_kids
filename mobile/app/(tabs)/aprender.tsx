import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router, type Href } from "expo-router";
import { SolarIcon, SolarIconName } from "@/components/SolarIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { tabBarClearance } from "@/constants/tabBar";
import { PillText } from "@/components/PillText";
import { useI18n } from "@/i18n";

interface ActivityCardProps {
  href: Href;
  icon: SolarIconName;
  title: string;
  description: string;
  color: string;
  background: string;
  tag: string;
}

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
  const copy = useI18n();
  const tabBarHeight = tabBarClearance(insets.bottom);
  const activities: ActivityCardProps[] = [
    {
      href: "/atividade/memoria",
      icon: "gamepad",
      title: copy.learn.memory,
      description: copy.learn.memoryDetail,
      tag: copy.learn.tags.game,
      color: colors.primary,
      background: colors.primaryWash,
    },
    {
      href: "/atividade/ache",
      icon: "volume-loud",
      title: copy.learn.find,
      description: copy.learn.findDetail,
      tag: copy.learn.tags.listen,
      color: getCategoryColor("greenAccent"),
      background: getCategoryBgColor("greenAccent"),
    },
    {
      href: "/atividade/repita",
      icon: "microphone",
      title: copy.learn.repeat,
      description: copy.learn.repeatDetail,
      tag: copy.learn.tags.speak,
      color: getCategoryColor("pink"),
      background: getCategoryBgColor("pink"),
    },
    {
      href: "/atividade/frase",
      icon: "text-field",
      title: copy.learn.build,
      description: copy.learn.buildDetail,
      tag: copy.learn.tags.phrase,
      color: getCategoryColor("purple"),
      background: getCategoryBgColor("purple"),
    },
    {
      href: "/atividade/historia",
      icon: "book",
      title: copy.learn.story,
      description: copy.learn.storyDetail,
      tag: copy.learn.tags.read,
      color: getCategoryColor("orange"),
      background: getCategoryBgColor("orange"),
    },
  ];

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
        {activities.map((activity, index) => (
          <View key={activity.title}>
            {index > 0 ? <View className="h-px bg-line" /> : null}
            <ActivityCard {...activity} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
