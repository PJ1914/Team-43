import { create } from "zustand";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";
import api from "../services/api";
import { UserProfile } from "../types";

interface AuthState {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setFirebaseUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  isLoading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  fetchProfile: async () => {
    try {
      const { data } = await api.get<{ user: UserProfile }>("/auth/me");
      set({ profile: data.user, isLoading: false });
    } catch {
      set({ profile: null, isLoading: false });
    }
  },
  clearAuth: () => set({ firebaseUser: null, profile: null, isLoading: false }),
}));

export const initAuthListener = () => {
  const store = useAuthStore.getState();
  return onAuthStateChanged(auth, async (user) => {
    store.setFirebaseUser(user);
    if (user) {
      await useAuthStore.getState().fetchProfile();
      return;
    }
    useAuthStore.getState().clearAuth();
  });
};
