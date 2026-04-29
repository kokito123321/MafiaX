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

const BALANCE_KEY = (uid: string) => `@mafia-x/balance/${uid}`;
const GIFT_KEY = (uid: string) => `@mafia-x/gift-claimed/${uid}`;
const ROOMS_KEY = "@mafia-x/rooms";

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

const SEED_ROOMS: Room[] = [
  {
    id: "seed-1",
    name: "Don Vito's Table",
    hostNickname: "Vito",
    players: 6,
    capacity: 10,
    entryFee: 50,
    region: "Tbilisi",
    isLive: true,
  },
  {
    id: "seed-2",
    name: "Sicilian Nights",
    hostNickname: "Salvatore",
    players: 8,
    capacity: 10,
    entryFee: 100,
    region: "Batumi",
    isLive: true,
  },
  {
    id: "seed-3",
    name: "The Underground",
    hostNickname: "Tony",
    players: 3,
    capacity: 10,
    entryFee: 25,
    region: "Kutaisi",
    isLive: true,
  },
  {
    id: "seed-4",
    name: "Capo Royale",
    hostNickname: "Lucia",
    players: 7,
    capacity: 10,
    entryFee: 75,
    region: "Tbilisi",
    isLive: true,
  },
  {
    id: "seed-5",
    name: "Golden Whiskey",
    hostNickname: "Frank",
    players: 4,
    capacity: 10,
    entryFee: 30,
    region: "Rustavi",
    isLive: true,
  },
  {
    id: "seed-6",
    name: "Rooftop Mafia",
    hostNickname: "Carmela",
    players: 9,
    capacity: 10,
    entryFee: 200,
    region: "Tbilisi",
    isLive: true,
  },
  {
    id: "seed-7",
    name: "Family Reunion",
    hostNickname: "Paulie",
    players: 2,
    capacity: 10,
    entryFee: 10,
    region: "Gori",
    isLive: false,
  },
  {
    id: "seed-8",
    name: "Midnight Club",
    hostNickname: "Sophia",
    players: 5,
    capacity: 10,
    entryFee: 60,
    region: "Batumi",
    isLive: true,
  },
];

interface GameContextValue {
  balance: number;
  rooms: Room[];
  showGiftModal: boolean;
  giftAmount: number;
  dismissGiftModal: () => void;
  createRoom: (name?: string) => Room;
  addCoins: (n: number) => Promise<void>;
  spendCoins: (n: number) => Promise<boolean>;
}

const GameContext = createContext<GameContextValue | null>(null);

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

async function readRooms(): Promise<Room[]> {
  const raw = await AsyncStorage.getItem(ROOMS_KEY);
  if (!raw) return SEED_ROOMS;
  try {
    const parsed = JSON.parse(raw) as Room[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_ROOMS;
  } catch {
    return SEED_ROOMS;
  }
}

async function writeRooms(rooms: Room[]) {
  await AsyncStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(REGISTRATION_GIFT);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await readRooms();
      setRooms(r);
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      lastUserIdRef.current = null;
      return;
    }
    if (lastUserIdRef.current === user.id) return;
    lastUserIdRef.current = user.id;

    (async () => {
      const giftRaw = await AsyncStorage.getItem(GIFT_KEY(user.id));
      const balRaw = await AsyncStorage.getItem(BALANCE_KEY(user.id));
      let bal = balRaw ? parseInt(balRaw, 10) : 0;
      if (!Number.isFinite(bal)) bal = 0;

      if (giftRaw !== "1") {
        bal += REGISTRATION_GIFT;
        await AsyncStorage.setItem(GIFT_KEY(user.id), "1");
        await AsyncStorage.setItem(BALANCE_KEY(user.id), String(bal));
        setGiftAmount(REGISTRATION_GIFT);
        setShowGiftModal(true);
      }
      setBalance(bal);
    })();
  }, [user]);

  const persistBalance = useCallback(
    async (uid: string, value: number) => {
      await AsyncStorage.setItem(BALANCE_KEY(uid), String(value));
    },
    [],
  );

  const addCoins = useCallback(
    async (n: number) => {
      if (!user) return;
      setBalance((prev) => {
        const next = Math.max(0, prev + n);
        void persistBalance(user.id, next);
        return next;
      });
    },
    [user, persistBalance],
  );

  const spendCoins = useCallback(
    async (n: number) => {
      if (!user) return false;
      if (balance < n) return false;
      const next = balance - n;
      setBalance(next);
      await persistBalance(user.id, next);
      return true;
    },
    [user, balance, persistBalance],
  );

  const createRoom = useCallback<GameContextValue["createRoom"]>(
    (name) => {
      const hostNickname = user?.nickname ?? "Guest";
      const room: Room = {
        id: makeId(),
        name: name?.trim() || `${hostNickname}'s Table`,
        hostNickname,
        players: 1,
        capacity: 10,
        entryFee: 25,
        region: "Tbilisi",
        isLive: true,
      };
      setRooms((prev) => {
        const next = [room, ...prev];
        void writeRooms(next);
        return next;
      });
      return room;
    },
    [user],
  );

  const dismissGiftModal = useCallback(() => setShowGiftModal(false), []);

  const value = useMemo<GameContextValue>(
    () => ({
      balance,
      rooms,
      showGiftModal,
      giftAmount,
      dismissGiftModal,
      createRoom,
      addCoins,
      spendCoins,
    }),
    [
      balance,
      rooms,
      showGiftModal,
      giftAmount,
      dismissGiftModal,
      createRoom,
      addCoins,
      spendCoins,
    ],
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
