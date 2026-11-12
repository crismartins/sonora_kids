import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, { CustomerInfo, PACKAGE_TYPE, PURCHASES_ERROR_CODE, PurchasesPackage } from "react-native-purchases";

/**
 * One-time unlock.
 * RevenueCat entitlement id: premium
 * Current offering needs a lifetime package tied to that entitlement.
 * Store product example: sonora_premium (non-consumable).
 * Keys live in mobile/.env:
 * EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
 * EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
 * EXPO_PUBLIC_REVENUECAT_TEST_API_KEY is used in development when the store key is absent.
 */
export const PREMIUM_ENTITLEMENT = "premium";
const PRODUCT_ID = "sonora_premium";
const CACHE_KEY = "sonora.premium";

export type PurchaseOutcome = "purchased" | "cancelled" | "unavailable" | "missing" | "failed" | "pending";
export type RestoreOutcome = "restored" | "empty" | "unavailable" | "failed";

function storePlatform() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

function apiKey() {
  const platformKey =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  if (platformKey) return platformKey;
  if (__DEV__) return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? "";
  return "";
}

export function hasPremium(info: CustomerInfo) {
  return info.entitlements.active[PREMIUM_ENTITLEMENT] != null;
}

function isCancelled(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { userCancelled?: boolean | null; code?: string };
  return candidate.userCancelled === true || candidate.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}

let configurePromise: Promise<boolean> | null = null;

export function configurePurchases() {
  if (!configurePromise) configurePromise = configureOnce();
  return configurePromise;
}

async function configureOnce() {
  const key = apiKey();
  if (!storePlatform() || !key) return false;
  try {
    if (__DEV__) await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: key });
    return true;
  } catch {
    configurePromise = null;
    return false;
  }
}

function lifetimePackage(packages: PurchasesPackage[]) {
  return (
    packages.find((pack) => pack.packageType === PACKAGE_TYPE.LIFETIME) ??
    packages.find((pack) => pack.product.identifier === PRODUCT_ID) ??
    null
  );
}

async function currentLifetime() {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current;
  if (!offering) return null;
  return offering.lifetime ?? lifetimePackage(offering.availablePackages);
}

export async function loadPremiumPrice() {
  const ready = await configurePurchases();
  if (!ready) return null;
  try {
    const pack = await currentLifetime();
    return pack?.product.priceString ?? null;
  } catch {
    return null;
  }
}

export async function purchasePremium(): Promise<PurchaseOutcome> {
  const ready = await configurePurchases();
  if (!ready) return "unavailable";
  try {
    const pack = await currentLifetime();
    if (!pack) return "missing";
    const { customerInfo } = await Purchases.purchasePackage(pack);
    return hasPremium(customerInfo) ? "purchased" : "pending";
  } catch (error) {
    if (isCancelled(error)) return "cancelled";
    return "failed";
  }
}

export async function restorePremium(): Promise<RestoreOutcome> {
  const ready = await configurePurchases();
  if (!ready) return "unavailable";
  try {
    const info = await Purchases.restorePurchases();
    return hasPremium(info) ? "restored" : "empty";
  } catch {
    return "failed";
  }
}

export async function refreshPremium() {
  const ready = await configurePurchases();
  if (!ready) return null;
  const info = await Purchases.getCustomerInfo();
  return hasPremium(info);
}

export function watchPremium(onChange: (isPremium: boolean) => void) {
  const listener = (info: CustomerInfo) => onChange(hasPremium(info));
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export async function readPremiumCache() {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  return raw === "1";
}

export async function writePremiumCache(isPremium: boolean) {
  await AsyncStorage.setItem(CACHE_KEY, isPremium ? "1" : "0");
}
