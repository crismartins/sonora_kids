import React from "react";
import { View, Text, ScrollView, Pressable, Platform, Image } from "react-native";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { PillText } from "@/components/PillText";

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
    <Pressable className="flex-row items-center gap-3 py-3 active:opacity-90">
      <View
        className="h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-quicksand text-[21px] text-dark">{title}</Text>
        <Text className="font-quicksand text-base text-neutral-dark">
          {description}
        </Text>
      </View>
      <View
        className="h-7 items-center justify-center rounded-full px-2.5"
        style={{ backgroundColor: bgColor }}
      >
        <PillText size={14} style={{ color: tagColor }}>
          {comingSoon ? "Em breve" : tag}
        </PillText>
      </View>
    </Pressable>
  );
}

export default function AprenderScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

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
      <Pressable className="min-h-[140px] flex-row items-center justify-between rounded-3xl bg-primary p-6">
        <View className="flex-1 gap-2">
          <MaterialIcons name="sports-esports" size={40} color="#fff" />
          <Text className="font-quicksand text-4xl text-white">
            APRENDA{"\n"}JOGANDO
          </Text>
        </View>
        <Image
          source={AVATAR}
          className="h-20 w-20 rounded-full border-[3px] border-white/40"
        />
      </Pressable>

      <View className="rounded-[20px] border border-[#F0F0F0] bg-[#FAFAFA] p-4">
        <Text className="mb-2 font-quicksand text-[22px] uppercase tracking-wide text-neutral-dark">
          Atividades
        </Text>
        <ActivityCard
          icon={<MaterialCommunityIcons name="cards-outline" size={26} color={colors.primary} />}
          title="Memória com PECS"
          description="Encontre os pares de palavras"
          tag="Jogo"
          bgColor="#E3F2FD"
          tagColor={colors.primary}
          comingSoon
        />
        <View className="h-px bg-[#F0F0F0]" />
        <ActivityCard
          icon={<Ionicons name="mic-outline" size={26} color="#00897B" />}
          title="Repita Comigo"
          description="Pratique pronunciar palavras"
          tag="Fala"
          bgColor="#E0F2F1"
          tagColor="#00897B"
          comingSoon
        />
        <View className="h-px bg-[#F0F0F0]" />
        <ActivityCard
          icon={<MaterialCommunityIcons name="puzzle-outline" size={26} color="#6A1B9A" />}
          title="Monte a Frase"
          description="Arraste ícones e forme frases"
          tag="Atividade"
          bgColor="#EDE7F6"
          tagColor="#6A1B9A"
          comingSoon
        />
        <View className="h-px bg-[#F0F0F0]" />
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
    </ScrollView>
  );
}
