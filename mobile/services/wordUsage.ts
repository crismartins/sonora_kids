import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sonora.wordUsage";
const TOP_LIMIT = 10;

export interface UsedWord {
  title: string;
  color: string;
  count: number;
  lastUsedAt: number;
}

let cache: UsedWord[] | null = null;
let queue: Promise<void> = Promise.resolve();

function isUsedWord(value: unknown): value is UsedWord {
  if (!value || typeof value !== "object") return false;
  const word = value as UsedWord;
  return (
    typeof word.title === "string" &&
    typeof word.color === "string" &&
    typeof word.count === "number" &&
    typeof word.lastUsedAt === "number"
  );
}

async function readUsage(): Promise<UsedWord[]> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    cache = [];
    return cache;
  }
  const parsed: unknown = JSON.parse(raw);
  cache = Array.isArray(parsed) ? parsed.filter(isUsedWord) : [];
  return cache;
}

function normalizeTitle(title: string) {
  return title.trim().toLocaleUpperCase("pt-BR");
}

export function recordWordUse(title: string, color: string) {
  const normalized = normalizeTitle(title);
  if (!normalized) return;
  queue = queue
    .then(async () => {
      const usage = await readUsage();
      const existing = usage.find((word) => word.title === normalized);
      if (existing) {
        existing.count += 1;
        existing.color = color || existing.color;
        existing.lastUsedAt = Date.now();
      } else {
        usage.push({
          title: normalized,
          color: color || "blue",
          count: 1,
          lastUsedAt: Date.now(),
        });
      }
      cache = usage;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    })
    .catch(() => undefined);
}

export async function loadTopWords(limit = TOP_LIMIT): Promise<UsedWord[]> {
  await queue;
  const usage = await readUsage();
  return [...usage]
    .sort((a, b) => b.count - a.count || b.lastUsedAt - a.lastUsedAt)
    .slice(0, limit);
}
