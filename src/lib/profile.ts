import { generateUsername } from "./username";
import { useLocalStorage } from "./use-local-storage";

export interface Profile {
  username: string;
  onboarded: boolean;
  todayMood?: string;
  reason?: string;
  hasAccount?: boolean;
}

const KEY = "foronce.profile";

export function useProfile() {
  const [profile, setProfile, hydrated] = useLocalStorage<Profile | null>(KEY, null);

  const enterAnonymously = () => {
    const p: Profile = { username: generateUsername(), onboarded: false };
    setProfile(p);
    return p;
  };

  const update = (patch: Partial<Profile>) =>
    setProfile((prev) => ({ ...(prev ?? { username: generateUsername(), onboarded: false }), ...patch }));

  return { profile, setProfile, update, enterAnonymously, hydrated };
}
