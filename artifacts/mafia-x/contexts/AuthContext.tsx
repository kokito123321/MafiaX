import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch, ApiError } from "@/lib/api";

const SESSION_KEY = "@mafia-x/session";
const TOKEN_KEY = "@mafia-x/token";

export type Gender = "male" | "female";

export interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUri?: string;
  balance: number;
  level: number;
  xp: number;
  createdAt: string;
  provider?: "email" | "google";
}

export type PublicUser = User;

interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  balance: number;
  level: number;
  xp: number;
  createdAt: string;
}

interface RegisterPayload {
  nickname: string;
  email: string;
  age: number;
  gender: Gender;
  password: string;
  provider?: "email" | "google";
}

interface AuthResponse {
  token: string;
  user: ApiUser;
  gift?: number;
}

interface AuthContextValue {
  user: PublicUser | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  loginWithGoogle: () => Promise<PublicUser>;
  register: (payload: RegisterPayload) => Promise<PublicUser>;
  logout: () => Promise<void>;
  setAvatar: (uri: string | null) => Promise<void>;
  refreshUser: () => Promise<PublicUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapApiUser(user: ApiUser): User {
  return {
    id: user.id,
    nickname: user.name,
    email: user.email,
    avatarUri: user.avatar ?? undefined,
    balance: user.balance,
    level: user.level,
    xp: user.xp,
    createdAt: user.createdAt,
    provider: "email", // Will be updated based on actual auth method
  };
}

async function loadSession(): Promise<{ token: string; user: PublicUser } | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!token || !raw) return null;
    try {
      const user = JSON.parse(raw) as PublicUser;
      return { token, user };
    } catch (parseError) {
      console.error('Failed to parse user session:', parseError);
      // Clear corrupted data
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      return null;
    }
  } catch (storageError) {
    console.error('Storage error during session load:', storageError);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadSession();
        if (saved) {
          const response = await apiFetch<{ user: ApiUser }>("/auth/me", {
            headers: {
              Authorization: `Bearer ${saved.token}`,
            },
          });
          const mapped = mapApiUser(response.user);
          setUser(mapped);
          setToken(saved.token);
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
          await AsyncStorage.setItem(TOKEN_KEY, saved.token);
        }
      } catch {
        await AsyncStorage.removeItem(SESSION_KEY);
        await AsyncStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const persistSession = useCallback(
    async (next: PublicUser | null, nextToken: string | null = null) => {
      setUser(next);
      setToken(nextToken);
      if (next && nextToken) {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
        await AsyncStorage.setItem(TOKEN_KEY, nextToken);
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    const response = await apiFetch<{ user: ApiUser }>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const mapped = mapApiUser(response.user);
    await persistSession(mapped, token);
    return mapped;
  }, [persistSession, token]);

  const register = useCallback<AuthContextValue["register"]>(
    async (payload) => {
      const response = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: payload.nickname.trim(),
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
        }),
      });
      const mapped = mapApiUser(response.user);
      await persistSession(mapped, response.token);
      return mapped;
    },
    [persistSession],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const response = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const mapped = mapApiUser(response.user);
      await persistSession(mapped, response.token);
      return mapped;
    },
    [persistSession],
  );

  const loginWithGoogle = useCallback<AuthContextValue["loginWithGoogle"]>(
    async () => {
      const demoEmail = "google.guest@mafia-x.app";
      const demoPassword = "google-guest-123";
      try {
        return await login(demoEmail, demoPassword);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return await register({
            nickname: "GoogleGuest",
            email: demoEmail,
            age: 21,
            gender: "male",
            password: demoPassword,
            provider: "google",
          });
        }
        throw error;
      }
    },
    [login, register],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // ignore logout errors
      }
    }
    await persistSession(null, null);
  }, [persistSession, token]);

  const setAvatar = useCallback<AuthContextValue["setAvatar"]>(
    async (uri) => {
      if (!token || !user) return;
      const response = await apiFetch<{ user: ApiUser }>("/auth/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: uri ?? null }),
      });
      const mapped = mapApiUser(response.user);
      await persistSession(mapped, token);
    },
    [token, user, persistSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      login,
      loginWithGoogle,
      register,
      logout,
      setAvatar,
      refreshUser,
    }),
    [user, initializing, login, loginWithGoogle, register, logout, setAvatar, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
