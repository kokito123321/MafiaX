import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { apiFetch } from "@/lib/api";

const TOKEN_KEY = "@mafia-x/token";
const GIFT_KEY = (uid: string) => `@mafia-x/gift-claimed/${uid}`;

const REGISTRATION_GIFT = 200;

export interface Room {
  id: string;
  name: string;
  hostNickname: string;
  players: number;
  capacity: number;
  entryFee: number;
  region: string;
  isLive: boolean;
}

export const ROOM_ENTRY_FEE = 1;

const SEED_ROOMS: Room[] = [
  {
    id: "seed-example",
    name: "example room",
    hostNickname: "Example Host",
    players: 4,
    capacity: 10,
    entryFee: ROOM_ENTRY_FEE,
    region: "Tbilisi",
    isLive: true,
  },
];

interface ApiRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  capacity: number;
  status: string;
  memberCount: number;
}

interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  balance: number;
  level: number;
  xp: number;
  createdAt: string;
}

interface GameContextValue {
  balance: number;
  rooms: Room[];
  showGiftModal: boolean;
  giftAmount: number;
  dismissGiftModal: () => void;
  createRoom: (name?: string) => Promise<Room>;
  addCoins: (n: number) => Promise<void>;
  joinRoom: (roomId: string, password?: string) => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

function mapRoom(room: ApiRoom): Room {
  return {
    id: room.id,
    name: room.name || `${room.hostName}'s Table`,
    hostNickname: room.hostName,
    players: room.memberCount,
    capacity: room.capacity,
    entryFee: ROOM_ENTRY_FEE,
    region: "Georgia",
    isLive: room.status === "live",
  };
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function authFetch<T>(path: string, init: RequestInit = {}) {
  const token = await getToken();
  if (!token) {
    throw new Error("No auth token available");
  }
  return apiFetch<T>(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(REGISTRATION_GIFT);
  const lastUserIdRef = useRef<string | null>(null);

  const loadRooms = useCallback(async () => {
    const response = await authFetch<{ rooms: ApiRoom[] }>("/rooms");
    setRooms(response.rooms.map(mapRoom));
  }, []);

  useEffect(() => {
    if (!user) {
      setRooms(SEED_ROOMS);
      setShowGiftModal(false);
      lastUserIdRef.current = null;
      return;
    }

    if (lastUserIdRef.current === user.id) {
      return;
    }

    lastUserIdRef.current = user.id;

    (async () => {
      try {
        await loadRooms();
      } catch {
        setRooms(SEED_ROOMS);
      }

      const giftRaw = await AsyncStorage.getItem(GIFT_KEY(user.id));
      if (giftRaw !== "1") {
        setGiftAmount(user.balance);
        setShowGiftModal(true);
        await AsyncStorage.setItem(GIFT_KEY(user.id), "1");
      }
    })();
  }, [user, loadRooms]);

  const createRoom = useCallback<GameContextValue["createRoom"]>(
    async (name) => {
      const response = await authFetch<{ room: ApiRoom }>("/rooms", {
        method: "POST",
        body: JSON.stringify({
          name: name?.trim() || `${user?.nickname ?? "Guest"}'s Table`,
          isPrivate: false,
          capacity: 10,
        }),
      });
      await loadRooms();
      await refreshUser();
      return mapRoom(response.room);
    },
    [loadRooms, refreshUser, user?.nickname],
  );

  const joinRoom = useCallback<GameContextValue["joinRoom"]>(
    async (roomId, password) => {
      await authFetch<{ ok: true; seatNumber: number }>(`/rooms/${roomId}/join`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      await loadRooms();
      await refreshUser();
    },
    [loadRooms, refreshUser],
  );

  const addCoins = useCallback<GameContextValue["addCoins"]>(
    async (n) => {
      if (!user) return;
      await authFetch<{ user: AuthUserResponse }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ balance: user.balance + n }),
      });
      await refreshUser();
    },
    [refreshUser, user],
  );

  const dismissGiftModal = useCallback(() => setShowGiftModal(false), []);

  const value = useMemo<GameContextValue>(
    () => ({
      balance: user?.balance ?? 0,
      rooms,
      showGiftModal,
      giftAmount,
      dismissGiftModal,
      createRoom,
      addCoins,
      joinRoom,
    }),
    [user?.balance, rooms, showGiftModal, giftAmount, dismissGiftModal, createRoom, addCoins, joinRoom],
  );

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
