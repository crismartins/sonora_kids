import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";

export function usePillPager(count: number, initialIndex = 0, onIndexChange?: (index: number) => void) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const chipScrollRef = useRef<ScrollViewInstance>(null);
  const pagerRef = useRef<ScrollViewInstance>(null);
  const chipLayouts = useRef<Record<number, { x: number; width: number }>>({});
  const chipViewportWidth = useRef(0);
  const selectedIndexRef = useRef(selectedIndex);
  const pageWidthRef = useRef(0);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(count);
  const onIndexChangeRef = useRef(onIndexChange);
  const contentOffsetRef = useRef({ x: 0, y: 0 });
  const didCaptureOffset = useRef(false);
  selectedIndexRef.current = selectedIndex;
  pageWidthRef.current = pageSize.width;
  countRef.current = count;
  onIndexChangeRef.current = onIndexChange;

  const scrollToSelectedChip = useCallback((index: number) => {
    const layout = chipLayouts.current[index];
    const viewport = chipViewportWidth.current;
    if (!layout || !viewport || !chipScrollRef.current) return;
    const x = Math.max(0, layout.x - (viewport - layout.width) / 2);
    chipScrollRef.current.scrollTo({ x, animated: true });
  }, []);

  const selectIndex = useCallback((index: number, source: "chip" | "pager") => {
    if (index < 0 || index >= countRef.current) return false;
    if (index === selectedIndexRef.current) return false;
    selectedIndexRef.current = index;
    setSelectedIndex(index);
    onIndexChangeRef.current?.(index);
    if (source === "chip" && pageWidthRef.current > 0) {
      pagerRef.current?.scrollTo({
        x: index * pageWidthRef.current,
        animated: true,
      });
    }
    return true;
  }, []);

  const syncFromOffset = useCallback(
    (offsetX: number) => {
      const width = pageWidthRef.current;
      if (!width) return;
      selectIndex(Math.round(offsetX / width), "pager");
    },
    [selectIndex],
  );

  const onPagerScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = setTimeout(() => {
        syncFromOffset(offsetX);
      }, 80);
    },
    [syncFromOffset],
  );

  const onPagerMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncFromOffset(event.nativeEvent.contentOffset.x);
    },
    [syncFromOffset],
  );

  useEffect(() => {
    scrollToSelectedChip(selectedIndex);
  }, [selectedIndex, scrollToSelectedChip]);

  useEffect(() => {
    if (!pageSize.width) return;
    pagerRef.current?.scrollTo({
      x: selectedIndexRef.current * pageSize.width,
      animated: false,
    });
  }, [pageSize.width]);

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, []);

  const onChipRowLayout = useCallback(
    (event: LayoutChangeEvent) => {
      chipViewportWidth.current = event.nativeEvent.layout.width;
      scrollToSelectedChip(selectedIndexRef.current);
    },
    [scrollToSelectedChip],
  );

  const onChipLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      chipLayouts.current[index] = { x, width };
      if (index === selectedIndexRef.current) scrollToSelectedChip(index);
    },
    [scrollToSelectedChip],
  );

  const onPagerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (!didCaptureOffset.current && width > 0) {
      didCaptureOffset.current = true;
      contentOffsetRef.current = { x: selectedIndexRef.current * width, y: 0 };
    }
    setPageSize((current) => (current.width === width && current.height === height ? current : { width, height }));
  }, []);

  return {
    selectedIndex,
    pageSize,
    chipScrollRef,
    pagerRef,
    contentOffset: contentOffsetRef.current,
    selectIndex,
    onPagerScroll,
    onPagerMomentumEnd,
    onChipRowLayout,
    onChipLayout,
    onPagerLayout,
  };
}
