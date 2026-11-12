import React from "react";
import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { ActivityChrome } from "@/components/activities/ActivityChrome";
import { EmptyState } from "@/components/ScreenState";
import { useI18n } from "@/i18n";

const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const nativeReady =
  Platform.OS === "web" || (!inExpoGo && requireOptionalNativeModule("ExpoSpeechRecognition") != null);

const Listening = nativeReady
  ? (require("@/components/activities/RepitaListening") as typeof import("@/components/activities/RepitaListening")).default
  : null;

export default function RepitaScreen() {
  const copy = useI18n();
  if (!Listening) {
    return (
      <ActivityChrome title={copy.learn.repeat}>
        <EmptyState
          icon="microphone"
          title={copy.learn.installApp}
          detail={copy.learn.expoDetail}
        />
      </ActivityChrome>
    );
  }

  return <Listening />;
}
