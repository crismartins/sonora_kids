import React from "react";
import { View, Text, Modal, Pressable, ScrollView, Image, ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, getCategoryBgColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export interface RoutinePecOption {
  id: string;
  title: string;
  image?: ImageSourcePropType;
}

interface AddRoutineItemModalProps {
  visible: boolean;
  title: string;
  options: RoutinePecOption[];
  selectedIds: string[];
  onClose: () => void;
  onToggle: (option: RoutinePecOption) => void;
  onConfirm: () => void;
  onCreate: () => void;
}

export function AddRoutineItemModal({
  visible,
  title,
  options,
  selectedIds,
  onClose,
  onToggle,
  onConfirm,
  onCreate,
}: AddRoutineItemModalProps) {
  const insets = useSafeAreaInsets();
  const background = getCategoryBgColor("deepPurple");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View
          className="flex-row items-center justify-between border-b border-[#F0F0F0] px-4 pb-3"
          style={{ paddingTop: insets.top + 12 }}
        >
          <Pressable
            accessibilityLabel="Fechar"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]"
          >
            <Ionicons name="close" size={22} color={colors.dark} />
          </Pressable>
          <Text className="font-dongle-bold text-3xl text-dark">{title}</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 156,
          }}
        >
          {options.length === 0 ? (
            <Text className="text-center font-dongle text-xl text-neutral-dark">
              Nenhum PEC de Dia a Dia ainda.
            </Text>
          ) : (
            <View className="flex-row flex-wrap">
              {options.map((option) => {
                const selected = selectedIds.includes(option.id);
                return (
                  <View key={option.id} className="w-1/2">
                    <Pressable
                      accessibilityLabel={
                        selected ? `Tirar seleção de ${option.title}` : `Selecionar ${option.title}`
                      }
                      onPress={() => onToggle(option)}
                      className="m-[5px] min-h-[150px] items-center justify-center rounded-[20px] p-3"
                      style={{ backgroundColor: background }}
                    >
                      <Image
                        source={option.image ?? FALLBACK_IMAGE}
                        className="mb-2.5 h-[88px] w-[88px] rounded-full bg-white"
                      />
                      <View className="max-w-full items-center justify-center rounded-full bg-white px-3 py-1">
                        <PillText size={20} numberOfLines={2} style={{ color: "#001D4A" }}>
                          {option.title}
                        </PillText>
                      </View>
                      {selected ? (
                        <View className="absolute right-3 top-3">
                          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                        </View>
                      ) : null}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom + 12,
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          <View className="items-end" pointerEvents="box-none">
            <Pressable
              accessibilityLabel="Criar PEC"
              onPress={onCreate}
              className="h-14 w-14 items-center justify-center rounded-full bg-primary"
              style={{
                shadowColor: "#001D4A",
                shadowOpacity: 0.22,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </Pressable>
          </View>
          <Pressable
            accessibilityLabel="Confirmar"
            onPress={onConfirm}
            className="h-14 w-full items-center justify-center rounded-full bg-primary"
            style={{
              shadowColor: "#001D4A",
              shadowOpacity: 0.22,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Text className="font-dongle-bold text-2xl text-white">Confirmar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
