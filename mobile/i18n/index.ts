import { useMemo } from "react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { CATALOG } from "@/i18n/catalog";
import { getActiveLocale } from "@/i18n/locale";
import { UI, Messages } from "@/i18n/messages";
import { SpeechLanguage } from "@/services/appSettings";

function titleKey(title: string) {
  return title.trim().toLocaleLowerCase("pt-BR");
}

export function lookupCatalog(title: string, language: SpeechLanguage, feminine = false) {
  if (language === "pt-BR") return null;
  const entry = CATALOG[titleKey(title)];
  if (!entry) return null;
  if (language === "pt-PT") return (feminine ? entry.ptF : undefined) ?? entry.pt ?? null;
  if (language === "es") return (feminine ? entry.esF : undefined) ?? entry.es;
  return entry.en;
}

/** Category names and other catalog phrases. Unknown text stays as written. */
export function localizeName(name: string, language: SpeechLanguage = getActiveLocale()) {
  return lookupCatalog(name, language) ?? name;
}

export function useI18n(): Messages {
  const { settings } = useAppSettings();
  return useMemo(() => UI[settings.language], [settings.language]);
}
