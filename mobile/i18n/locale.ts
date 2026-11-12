import { SpeechLanguage } from "@/services/appSettings";

let active: SpeechLanguage = "pt-BR";

export function setActiveLocale(language: SpeechLanguage) {
  active = language;
}

export function getActiveLocale(): SpeechLanguage {
  return active;
}
