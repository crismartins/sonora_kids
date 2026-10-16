import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AvatarChoice,
  ChildProfile,
  commitProfile,
  DEFAULT_PROFILE,
  loadProfile,
} from "@/services/profile";

interface ProfileContextValue {
  ready: boolean;
  profile: ChildProfile;
  saveProfile: (draft: {
    nickname: string;
    name: string;
    avatar: AvatarChoice;
    pendingPhotoUri?: string | null;
  }) => Promise<ChildProfile>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((stored) => {
        if (!active) return;
        profileRef.current = stored;
        setProfile(stored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = useCallback(
    async (draft: {
      nickname: string;
      name: string;
      avatar: AvatarChoice;
      pendingPhotoUri?: string | null;
    }) => {
      const next = await commitProfile(profileRef.current, draft);
      profileRef.current = next;
      setProfile(next);
      return next;
    },
    [],
  );

  const value = useMemo(
    () => ({ ready, profile, saveProfile }),
    [ready, profile, saveProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile must be used within ProfileProvider");
  return value;
}
