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
import { PhraseCard } from "@/components/PhraseCard";
import { colors } from "@/constants/colors";
import { ROUTINE } from "@/constants/phrases";

export default function RotinaScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleSelectCategory = useCallback((idx: number) => {
    setSelectedCategory(idx);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const currentGroup = ROUTINE[selectedCategory];
  const tabBarHeight = Platform.OS === "web" ? 34 + 68 : insets.bottom + 8 + 68;

  return (
    <View style={[styles.container, { backgroundColor: colors.neutralLight }]}>
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {ROUTINE.map((group, idx) => {
            const isActive = idx === selectedCategory;
            return (
              <Pressable
                key={group.category}
                onPress={() => handleSelectCategory(idx)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.neutral : `${colors.neutral}66`,
                    borderWidth: isActive ? 1.5 : 0,
                    borderColor: isActive ? colors.primary : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: isActive ? colors.primary : colors.neutralDark },
                  ]}
                >
                  {group.category.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={currentGroup.collection}
        keyExtractor={(_, idx) => `routine-${idx}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PhraseCard phrase={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral,
  },
  chipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  chipLabel: {
    fontFamily: "Dongle-Bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingTop: 12,
  },
});
