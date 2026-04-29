import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const USERS_KEY = "@mafia-x/users";
const SESSION_KEY = "@mafia-x/session";

export type Gender = "male" | "female";

export interface User {
  id: string;
  nickname: string;
  email: string;
  age: number;
  gender: Gender;
  password: string;
  provider: "email" | "google";
  createdAt: string;
}

export type PublicUser = Omit<User, "password">;

interface RegisterPayload {
  nickname: string;
  email: string;
  age: number;
  gender: Gender;
  password: string;
  provider?: "email" | "google";
}

interface AuthContextValue {
  user: PublicUser | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  loginWithGoogle: () => Promise<PublicUser>;
  register: (payload: RegisterPayload) => Promise<PublicUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function strip(u: User): PublicUser {
  const { password: _password, ...rest } = u;
  return rest;
}

async function readUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          setUser(JSON.parse(raw) as PublicUser);
        }
      } catch {
        // ignore
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (next: PublicUser | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const register = useCallback<AuthContextValue["register"]>(
    async (payload) => {
      const users = await readUsers();
      const exists = users.find(
        (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
      );
      if (exists) {
        throw new Error("ამ მეილზე უკვე არსებობს ანგარიში");
      }
      const newUser: User = {
        id: makeId(),
        nickname: payload.nickname.trim(),
        email: payload.email.trim().toLowerCase(),
        age: payload.age,
        gender: payload.gender,
        password: payload.password,
        provider: payload.provider ?? "email",
        createdAt: new Date().toISOString(),
      };
      await writeUsers([...users, newUser]);
      const pub = strip(newUser);
      await persistSession(pub);
      return pub;
    },
    [persistSession],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const users = await readUsers();
      const found = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!found || found.password !== password) {
        throw new Error("მცდარი მეილი ან პაროლი");
      }
      const pub = strip(found);
      await persistSession(pub);
      return pub;
    },
    [persistSession],
  );

  const loginWithGoogle = useCallback<AuthContextValue["loginWithGoogle"]>(
    async () => {
      const users = await readUsers();
      const demoEmail = "google.guest@mafia-x.app";
      let found = users.find((u) => u.email === demoEmail);
      if (!found) {
        const newUser: User = {
          id: makeId(),
          nickname: "GoogleGuest",
          email: demoEmail,
          age: 21,
          gender: "male",
          password: "",
          provider: "google",
          createdAt: new Date().toISOString(),
        };
        await writeUsers([...users, newUser]);
        found = newUser;
      }
      const pub = strip(found);
      await persistSession(pub);
      return pub;
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await persistSession(null);
  }, [persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing, login, loginWithGoogle, register, logout }),
    [user, initializing, login, loginWithGoogle, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
