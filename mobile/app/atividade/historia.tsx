import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  type FlatList as FlatListType,
} from "react-native";
import { SolarIcon } from "@/components/SolarIcon";
import { IconButton } from "@/components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone, ActivityPrompt, activityPadding } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { STORIES, Story, StoryPage } from "@/data/stories";

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
      contentContainerStyle={activityPadding(insets.bottom)}
      showsVerticalScrollIndicator={false}
    >
      <ActivityPrompt instruction="Escolha uma história para ouvir" />
      <View className="gap-3">
        {STORIES.map((story) => {
          const color = getCategoryColor(story.colorName);
          const background = settings.highContrast ? colors.white : getCategoryBgColor(story.colorName);
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
                borderWidth: settings.highContrast ? 3 : 0,
                borderColor: color,
              }}
            >
              <StoryCover source={story.cover} color={color} />
              <View className="flex-1 gap-0.5">
                <Text className="font-quicksand text-[22px] text-dark">{story.title}</Text>
                <Text className="font-quicksand text-base text-neutral-dark">{story.summary}</Text>
              </View>
              <SolarIcon name="arrow-right" size={22} color={color} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function StoryCover({ source, color }: { source?: Story["cover"]; color: string }) {
  return (
    <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-[14px] bg-white">
      {source ? (
        <Image source={source} className="h-full w-full" resizeMode="cover" />
      ) : (
        <SolarIcon name="book" size={28} color={color} />
      )}
    </View>
  );
}

function PageImage({ page }: { page: StoryPage }) {
  return (
    <View className="mb-6 aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[22px] bg-white">
      {page.image ? (
        <Image source={page.image} className="h-full w-full" resizeMode="cover" />
      ) : (
        <SolarIcon name="gallery" size={56} color={colors.neutralDark} />
      )}
    </View>
  );
}

function StoryReader({ story, onClose }: { story: Story; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { settings, speak, stopSpeaking, haptic } = useAppSettings();
  const [page, setPage] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const listRef = useRef<FlatListType<StoryPage>>(null);
  const pageRef = useRef(0);
  const fromButton = useRef(false);
  const color = getCategoryColor(story.colorName);
  const background = settings.highContrast ? colors.white : getCategoryBgColor(story.colorName);
  const current = story.pages[page];

  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);

  useEffect(() => {
    if (!current || finished) return;
    const handle = setTimeout(() => speak(current.text), 200);
    return () => clearTimeout(handle);
  }, [current, finished, speak, page, story.id]);

  const settle = (offsetX: number) => {
    if (pageWidth <= 0) return;
    const next = Math.max(0, Math.min(story.pages.length - 1, Math.round(offsetX / pageWidth)));
    if (next === pageRef.current) {
      fromButton.current = false;
      return;
    }
    if (!fromButton.current) haptic();
    fromButton.current = false;
    pageRef.current = next;
    setPage(next);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const offset = event.nativeEvent.contentOffset.x;
    const nearest = Math.round(offset / pageWidth) * pageWidth;
    if (Math.abs(offset - nearest) > 12) return;
    settle(offset);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    settle(event.nativeEvent.contentOffset.x);
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocity = event.nativeEvent.velocity?.x ?? 0;
    if (Math.abs(velocity) > 0.1) return;
    settle(event.nativeEvent.contentOffset.x);
  };

  const go = (next: number) => {
    if (next < 0) return;
    if (next >= story.pages.length) {
      haptic();
      setFinished(true);
      return;
    }
    fromButton.current = true;
    haptic();
    pageRef.current = next;
    setPage(next);
    if (pageWidth > 0) {
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }
  };

  if (finished || !current) {
    return (
      <ActivityChrome title={story.title} onBack={onClose} announce={false}>
        <ActivityDone
          title="Fim da história"
          detail={story.title}
          againLabel="Ler de novo"
          onAgain={() => {
            pageRef.current = 0;
            setPage(0);
            setFinished(false);
          }}
          secondaryLabel="Outra história"
          onSecondary={onClose}
        />
      </ActivityChrome>
    );
  }

  return (
    <ActivityChrome title={story.title} onBack={onClose} announce={false}>
      <View className="flex-1" style={activityPadding(insets.bottom)}>
        <View
          className="flex-1 overflow-hidden rounded-[22px]"
          style={{
            backgroundColor: background,
            borderWidth: settings.highContrast ? 3 : 0,
            borderColor: color,
          }}
          onLayout={(event) => {
            const next = Math.round(event.nativeEvent.layout.width);
            setPageWidth((value) => (value === next ? value : next));
          }}
        >
          {pageWidth > 0 ? (
            <FlatList
              ref={listRef}
              data={story.pages}
              keyExtractor={(_, index) => `${story.id}-${index}`}
              horizontal
              pagingEnabled
              bounces={false}
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
              scrollEventThrottle={16}
              onScroll={onScroll}
              onMomentumScrollEnd={onScrollEnd}
              onScrollEndDrag={onScrollEndDrag}
              renderItem={({ item }) => (
                <View style={{ width: pageWidth }} className="h-full justify-center px-6 py-6">
                  <Pressable accessibilityLabel={item.text} onPress={() => speak(item.text)} className="items-center">
                    <PageImage page={item} />
                    <Text className="text-center font-quicksand text-3xl leading-10 text-dark">{item.text}</Text>
                    <View className="mt-6 flex-row items-center gap-2">
                      <SolarIcon name="volume-loud" size={20} color={colors.primary} />
                      <Text className="font-quicksand text-base text-primary">Toque para ouvir</Text>
                    </View>
                  </Pressable>
                </View>
              )}
            />
          ) : null}
        </View>

        <View className="mt-4 h-14 flex-row items-center justify-between">
          <IconButton
            icon="arrow-left"
            variant="neutral"
            size="md"
            accessibilityLabel="Página anterior"
            disabled={page === 0}
            inactiveReason={page === 0 ? "Primeira página" : undefined}
            onPress={() => go(page - 1)}
          />

          <View className="flex-row items-center gap-2">
            {story.pages.map((_, index) => (
              <View
                key={`${story.id}-dot-${index}`}
                className="h-2.5 rounded-full"
                style={{
                  width: index === page ? 22 : 10,
                  backgroundColor: index === page ? colors.primary : colors.neutral,
                }}
              />
            ))}
          </View>

          <IconButton
            icon={page === story.pages.length - 1 ? "check" : "arrow-right"}
            variant="primary"
            size="md"
            accessibilityLabel={page === story.pages.length - 1 ? "Terminar história" : "Próxima página"}
            onPress={() => go(page + 1)}
          />
        </View>
      </View>
    </ActivityChrome>
  );
}
