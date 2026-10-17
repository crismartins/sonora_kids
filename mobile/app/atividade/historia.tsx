import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SolarIcon } from "@/components/SolarIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { STORIES, Story } from "@/data/stories";

export default function HistoriaScreen() {
  const [story, setStory] = useState<Story | null>(null);

  if (!story) {
    return (
      <ActivityChrome title="História do Dia">
        <StoryList onOpen={setStory} />
      </ActivityChrome>
    );
  }

  return <StoryReader story={story} onClose={() => setStory(null)} />;
}

function StoryList({ onOpen }: { onOpen: (story: Story) => void }) {
  const insets = useSafeAreaInsets();
  const { settings, haptic } = useAppSettings();

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: insets.bottom + 24,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="px-1 pb-1 font-quicksand text-lg text-neutral-dark">
        Toque para ouvir a história
      </Text>
      {STORIES.map((story) => {
        const color = getCategoryColor(story.colorName);
        const background = settings.highContrast ? "#FFFFFF" : getCategoryBgColor(story.colorName);
        return (
          <Pressable
            key={story.id}
            accessibilityLabel={story.title}
            onPress={() => {
              haptic();
              onOpen(story);
            }}
            className="min-h-[92px] flex-row items-center gap-4 rounded-[22px] px-4 py-4 active:opacity-90"
            style={{
              backgroundColor: background,
              borderWidth: settings.highContrast ? 2 : 0,
              borderColor: color,
            }}
          >
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
              <SolarIcon name={story.icon} size={30} color={color} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="font-quicksand text-[22px] text-dark">{story.title}</Text>
              <Text className="font-quicksand text-base text-neutral-dark">{story.summary}</Text>
            </View>
            <SolarIcon name="alt-arrow-right" size={22} color={color} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function StoryReader({ story, onClose }: { story: Story; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { settings, speak, haptic } = useAppSettings();
  const [page, setPage] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = story.pages[page];
  const color = getCategoryColor(current?.colorName ?? "blue");
  const background = settings.highContrast
    ? "#FFFFFF"
    : getCategoryBgColor(current?.colorName ?? "blue");

  useEffect(() => {
    if (!current || finished) return;
    const handle = setTimeout(() => speak(current.text), 200);
    return () => clearTimeout(handle);
  }, [current, finished, speak, page, story.id]);

  if (finished || !current) {
    return (
      <ActivityChrome title={story.title} onBack={onClose} announce={false}>
        <ActivityDone
          title="Fim da história"
          detail={story.title}
          againLabel="Ler de novo"
          onAgain={() => {
            setPage(0);
            setFinished(false);
          }}
          secondaryLabel="Outra história"
          onSecondary={onClose}
        />
      </ActivityChrome>
    );
  }

  const go = (next: number) => {
    haptic();
    if (next >= story.pages.length) {
      setFinished(true);
      return;
    }
    setPage(next);
  };

  return (
    <ActivityChrome title={story.title} onBack={onClose} announce={false}>
      <View className="flex-1 px-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable
          accessibilityLabel={current.text}
          onPress={() => speak(current.text)}
          className="flex-1 items-center justify-center rounded-[28px] px-6"
          style={{
            backgroundColor: background,
            borderWidth: settings.highContrast ? 2 : 0,
            borderColor: color,
          }}
        >
          <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-white">
            <SolarIcon name={current.icon} size={68} color={color} />
          </View>
          <Text className="text-center font-quicksand text-4xl text-dark">{current.text}</Text>
          <View className="mt-6 flex-row items-center gap-2">
            <SolarIcon name="volume-loud" size={20} color={colors.primary} />
            <Text className="font-quicksand text-base text-primary">Toque para ouvir</Text>
          </View>
        </Pressable>

        <View className="mt-4 h-14 flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Página anterior"
            disabled={page === 0}
            onPress={() => go(page - 1)}
            className="h-12 w-12 items-center justify-center rounded-full bg-neutral active:opacity-80"
            style={{ opacity: page === 0 ? 0.35 : 1 }}
          >
            <SolarIcon name="alt-arrow-left" size={26} color={colors.primary} />
          </Pressable>

          <View className="flex-row items-center gap-2">
            {story.pages.map((item, index) => (
              <View
                key={`${story.id}-${item.text}`}
                className="h-2.5 rounded-full"
                style={{
                  width: index === page ? 22 : 10,
                  backgroundColor: index === page ? colors.primary : colors.neutral,
                }}
              />
            ))}
          </View>

          <Pressable
            accessibilityLabel={page === story.pages.length - 1 ? "Terminar história" : "Próxima página"}
            onPress={() => go(page + 1)}
            className="h-12 w-12 items-center justify-center rounded-full bg-primary active:opacity-90"
          >
            <SolarIcon
              name={page === story.pages.length - 1 ? "check" : "alt-arrow-right"}
              size={26}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>
    </ActivityChrome>
  );
}
