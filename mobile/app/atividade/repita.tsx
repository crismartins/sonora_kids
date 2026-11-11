import React from "react";
import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { ActivityChrome } from "@/components/activities/ActivityChrome";
import { EmptyState } from "@/components/ScreenState";

const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const nativeReady =
  Platform.OS === "web" || (!inExpoGo && requireOptionalNativeModule("ExpoSpeechRecognition") != null);

const Listening = nativeReady
  ? (require("@/components/activities/RepitaListening") as typeof import("@/components/activities/RepitaListening")).default
  : null;

export default function RepitaScreen() {
  if (!Listening) {
    return (
      <ActivityChrome title="Repita Comigo">
        <EmptyState
          icon="microphone"
          title="Abra o app instalado"
          detail="O Expo Go não reconhece a voz. Abra o Sonora Kids instalado no celular, não o Expo Go."
        />
      </ActivityChrome>
    );
  }

  return <Listening />;
}
