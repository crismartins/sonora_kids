import { useCallback, useEffect, useState } from "react";
import { MOCK_CATEGORIES } from "@/data/categories";
import { Category } from "@/types";

const LOAD_DELAY_MS = 350;

export function useCategories() {
  const [data, setData] = useState<Category[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, LOAD_DELAY_MS));
      setData(MOCK_CATEGORIES);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load categories"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    refetch: load,
  };
}
