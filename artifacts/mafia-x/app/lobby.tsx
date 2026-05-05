import { Feather } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandHeader } from "@/components/BrandHeader";
import { ProfilePanel } from "@/components/ProfilePanel";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

const SLOT_COUNT = 11;

interface ChatMsg {
  id: string;
  author: string;
  text: string;
  ts: number;
  system?: boolean;
}

interface Occupant {
  id: string;
  name: string;
  initial: string;
  avatarUri?: string | null;
  isHost: boolean;
  hasCamera: boolean;
  hasMic: boolean;
  micMuted: boolean;
  color: string;
}

interface Seat {
  number: number;
  occupant: Occupant | null;
}

const FAKE_COLORS = [
  "#7a4d9e",
  "#cf3a4f",
  "#3f8ed1",
  "#28a07a",
  "#d18b3a",
  "#9c5cd1",
  "#3aa9c4",
  "#c44a8e",
  "#5b9c3a",
  "#d1a13a",
];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export default function LobbyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { t, S } = useLanguage();

  const [profileOpen, setProfileOpen] = useState(false);
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  const [seats, setSeats] = useState<Seat[]>(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => ({
      number: i + 1,
      occupant: null,
    })),
  );
  const [armedSeat, setArmedSeat] = useState<number | null>(null);
  const [seatSelector, setSeatSelector] = useState<number | null>(null);
  const [moderation, setModeration] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      id: "sys-welcome",
      author: "system",
      text: "",
      ts: Date.now(),
      system: true,
    },
  ]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<ChatMsg>>(null);

  // Localize the welcome message when language changes
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === "sys-welcome" ? { ...m, text: t(S.lobby.welcome) } : m,
      ),
    );
  }, [t, S]);

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  // Auto-occupy seat 1 with current user as host
  useEffect(() => {
    if (!user) return;
    setSeats((prev) => {
      if (prev[0]?.occupant) return prev;
      const next = [...prev];
      next[0] = {
        number: 1,
        occupant: {
          id: user.id,
          name: user.nickname,
          initial: (user.nickname.charAt(0) ?? "U").toUpperCase(),
          avatarUri: user.avatarUri ?? null,
          isHost: true,
          hasCamera: false,
          hasMic: false,
          micMuted: false,
          color: "#cf3a4f",
        },
      };
      return next;
    });
  }, [user]);

  // Keep host avatar/name in sync if user updates profile
  useEffect(() => {
    if (!user) return;
    setSeats((prev) =>
      prev.map((s) =>
        s.occupant && s.occupant.isHost
          ? {
              ...s,
              occupant: {
                ...s.occupant,
                avatarUri: user.avatarUri ?? null,
                name: user.nickname,
                initial: (user.nickname.charAt(0) ?? "U").toUpperCase(),
              },
            }
          : s,
      ),
    );
  }, [user?.avatarUri, user?.nickname, user]);

  const occupiedCount = useMemo(
    () => seats.filter((s) => s.occupant).length,
    [seats],
  );
  const allSeated = occupiedCount >= SLOT_COUNT;

  const ensurePerms = useCallback(
    async (needCam: boolean, needMic: boolean) => {
      let camOk = camPerm?.granted ?? false;
      let micOk = micPerm?.granted ?? false;
      if (needCam && !camOk) {
        const r = await requestCamPerm();
        camOk = r.granted;
      }
      if (needMic && !micOk) {
        const r = await requestMicPerm();
        micOk = r.granted;
      }
      const okCam = !needCam || camOk;
      const okMic = !needMic || micOk;
      if (!okCam || !okMic) {
        Alert.alert(t(S.lobby.permsTitle), t(S.lobby.permsBody));
        return false;
      }
      return true;
    },
    [
      camPerm?.granted,
      micPerm?.granted,
      requestCamPerm,
      requestMicPerm,
      t,
      S,
    ],
  );

  const pushSystem = useCallback((text: string) => {
    setMessages((prev) => [
      {
        id: makeId(),
        author: "system",
        text,
        ts: Date.now(),
        system: true,
      },
      ...prev,
    ]);
  }, []);

  const swapSeats = useCallback(
    async (a: number, b: number) => {
      if (a === b) return;
      
      // Validate seat numbers
      if (a < 1 || a > SLOT_COUNT || b < 1 || b > SLOT_COUNT) {
        pushSystem(t(S.lobby.swapError) || "Invalid seat numbers");
        return;
      }

      try {
        setSeats((prev) => {
          const next = [...prev];
          const sa = next[a - 1];
          const sb = next[b - 1];
          
          // Additional validation
          if (!sa || !sb) {
            pushSystem(t(S.lobby.swapError) || "Seat not found");
            return prev;
          }
          
          // Don't swap if both seats are empty
          if (!sa.occupant && !sb.occupant) {
            pushSystem(t(S.lobby.swapError) || "Cannot swap empty seats");
            return prev;
          }
          
          // Perform the swap safely
          const tempOccupant = sa.occupant;
          next[a - 1] = { number: sa.number, occupant: sb.occupant };
          next[b - 1] = { number: sb.number, occupant: tempOccupant };
          return next;
        });
        
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        }
        pushSystem(`#${a} ⇄ #${b} — ${t(S.lobby.swapDone)}`);
      } catch (error) {
        console.error("Seat swap error:", error);
        pushSystem(t(S.lobby.swapError) || "Swap failed");
      }
    },
    [pushSystem, t, S],
  );

  const handleSeatPress = useCallback(
    (seatNum: number) => {
      try {
        // Validate seat number
        if (seatNum < 1 || seatNum > SLOT_COUNT) {
          return;
        }

        // Swap mode active
        if (armedSeat !== null) {
          if (armedSeat === seatNum) {
            setArmedSeat(null);
            return;
          }
          const a = armedSeat;
          setArmedSeat(null);
          swapSeats(a, seatNum);
          return;
        }
        
        const seat = seats[seatNum - 1];
        if (!seat) return;
        
        if (!seat.occupant) {
          setSeatSelector(seatNum);
        } else if (seat.occupant.isHost) {
          // host's own seat - allow toggling camera by re-running selector
          setSeatSelector(seatNum);
        } else {
          setModeration(seatNum);
        }
      } catch (error) {
        console.error("Handle seat press error:", error);
        pushSystem(t(S.lobby.swapError) || "Action failed");
      }
    },
    [armedSeat, seats, swapSeats, pushSystem, t, S],
  );

  const handleSeatLongPress = useCallback(
    async (seatNum: number) => {
      try {
        // Validate seat number
        if (seatNum < 1 || seatNum > SLOT_COUNT) {
          return;
        }
        
        const seat = seats[seatNum - 1];
        if (!seat?.occupant) return;
        
        setArmedSeat(seatNum);
        if (Platform.OS !== "web") {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        pushSystem(t(S.lobby.swapHint));
      } catch (error) {
        console.error("Handle seat long press error:", error);
        pushSystem(t(S.lobby.swapError) || "Action failed");
      }
    },
    [seats, pushSystem, t, S],
  );

  const handleJoinSeat = useCallback(
    async (seatNum: number, withCamera: boolean) => {
      setSeatSelector(null);
      const ok = await ensurePerms(withCamera, true);
      if (!ok) return;

      setSeats((prev) => {
        const next = [...prev];
        const target = next[seatNum - 1];
        if (!target) return prev;

        const existing = target.occupant;
        if (existing && existing.isHost) {
          // Update host's settings
          next[seatNum - 1] = {
            ...target,
            occupant: {
              ...existing,
              hasCamera: withCamera,
              hasMic: true,
            },
          };
        } else if (!existing) {
          // Add demo player
          const demoIdx = (seatNum - 1) % FAKE_COLORS.length;
          next[seatNum - 1] = {
            ...target,
            occupant: {
              id: `demo-${seatNum}-${makeId()}`,
              name: `Player ${seatNum}`,
              initial: String(seatNum),
              avatarUri: null,
              isHost: false,
              hasCamera: withCamera,
              hasMic: true,
              micMuted: false,
              color: FAKE_COLORS[demoIdx]!,
            },
          };
        }
        return next;
      });

      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
      pushSystem(
        `${t(S.lobby.seat)} #${seatNum} — ${
          withCamera ? t(S.lobby.cameraOn) : t(S.lobby.micOnly)
        }`,
      );
    },
    [ensurePerms, pushSystem, t, S],
  );

  const handleAddDemoPlayer = useCallback(async () => {
    const empty = seats.find((s) => !s.occupant);
    if (!empty) return;
    setSeats((prev) => {
      const next = [...prev];
      const target = next[empty.number - 1];
      if (!target || target.occupant) return prev;
      const demoIdx = (empty.number - 1) % FAKE_COLORS.length;
      next[empty.number - 1] = {
        ...target,
        occupant: {
          id: `demo-${empty.number}-${makeId()}`,
          name: `Player ${empty.number}`,
          initial: String(empty.number),
          avatarUri: null,
          isHost: false,
          hasCamera: Math.random() > 0.5,
          hasMic: true,
          micMuted: false,
          color: FAKE_COLORS[demoIdx]!,
        },
      };
      return next;
    });
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
  }, [seats]);

  const closeModeration = useCallback(() => setModeration(null), []);

  const moderationAction = useCallback(
    (action: "kick" | "mute" | "block" | "ban") => {
      if (moderation === null) return;
      const seatNum = moderation;
      setSeats((prev) => {
        const next = [...prev];
        const target = next[seatNum - 1];
        if (!target?.occupant) return prev;
        if (action === "mute") {
          next[seatNum - 1] = {
            ...target,
            occupant: { ...target.occupant, micMuted: !target.occupant.micMuted },
          };
        } else {
          // kick / block / ban — remove occupant
          next[seatNum - 1] = { ...target, occupant: null };
        }
        return next;
      });
      const occName = seats[seatNum - 1]?.occupant?.name ?? `#${seatNum}`;
      const labels: Record<typeof action, string> = {
        kick: t(S.lobby.kick),
        mute: t(S.lobby.mute),
        block: t(S.lobby.block),
        ban: t(S.lobby.ban),
      };
      pushSystem(`${labels[action]}: ${occName}`);
      closeModeration();
    },
    [moderation, seats, pushSystem, t, S, closeModeration],
  );

  const handleSend = useCallback(async () => {
    if (!user) return;
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    setMessages((prev) => [
      {
        id: makeId(),
        author: user.nickname,
        text,
        ts: Date.now(),
      },
      ...prev,
    ]);
  }, [draft, user]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/rooms");
    }
  }, []);

  const handleLogoutFromPanel = useCallback(async () => {
    setProfileOpen(false);
    await logout();
    router.replace("/");
  }, [logout]);

  const handleProfilePhoto = useCallback(() => {
    setProfileOpen(false);
    router.push("/profile");
  }, []);

  if (!user) return null;

  const initial = (user.nickname.charAt(0) ?? "U").toUpperCase();
  const topPad = Math.max(insets.top, 16);

  const moderationOccupant =
    moderation !== null ? seats[moderation - 1]?.occupant ?? null : null;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.lobbyBackground },
      ]}
    >
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: "rgba(0,0,0,0.18)",
              borderColor: colors.brandPurple,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="arrow-left" size={18} color="#fff" />
        </Pressable>

        <BrandHeader
          background="transparent"
          variant="dark"
          style={styles.headerInline}
        />

        <Pressable
          onPress={() => setProfileOpen(true)}
          hitSlop={12}
          style={({ pressed }) => [
            styles.avatarBtn,
            {
              borderColor: colors.brandRed,
              backgroundColor: colors.brandPurple,
              opacity: pressed ? 0.85 : 1,
              overflow: "hidden",
            },
          ]}
        >
          {user.avatarUri ? (
            <Image
              source={{ uri: user.avatarUri }}
              style={styles.avatarImg}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.avatarBtnText}>{initial}</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <View style={styles.gridShellOuter}>
            <View
              style={[
                styles.gridShell,
                {
                  backgroundColor: colors.lobbySurface,
                  borderColor: colors.brandPurple,
                },
              ]}
            >
              {seats.map((s) => (
                <CameraSlot
                  key={s.number}
                  seat={s}
                  isArmed={armedSeat === s.number}
                  swapMode={armedSeat !== null}
                  onPress={() => handleSeatPress(s.number)}
                  onLongPress={() => handleSeatLongPress(s.number)}
                  borderColor={colors.brandPurple}
                  activeBorderColor={colors.brandRed}
                  armedColor={colors.brandOrange}
                  tileBg={colors.lobbyTileBg}
                  mutedText={colors.lobbyChatMuted}
                  hostBadgeBg={colors.brandRed}
                  seatLabel={t(S.lobby.seat)}
                />
              ))}
            </View>
            {armedSeat !== null ? (
              <View
                style={[
                  styles.armBanner,
                  { backgroundColor: colors.brandOrange },
                ]}
              >
                <Feather name="move" size={12} color="#0a0a0a" />
                <Text style={styles.armBannerText}>
                  {t(S.lobby.armSwap)} #{armedSeat} — {t(S.lobby.swapHint)}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.chatWrap,
              {
                backgroundColor: colors.lobbyChatBg,
                borderColor: colors.brandPurple,
              },
            ]}
          >
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colors.brandRed },
                  ]}
                />
                <Text style={styles.chatTitle}>{t(S.lobby.chatTitle)}</Text>
              </View>
              <View style={styles.chatHeaderRight}>
                <Pressable
                  onPress={handleAddDemoPlayer}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.addDemoBtn,
                    {
                      borderColor: colors.brandOrange,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.addDemoText,
                      { color: colors.brandOrange },
                    ]}
                  >
                    {t(S.lobby.addDemo)}
                  </Text>
                </Pressable>
                <Text style={styles.chatCount}>
                  {occupiedCount}/{SLOT_COUNT}
                </Text>
              </View>
            </View>

            {/* Get-ready watermark behind chat list */}
            {allSeated ? (
              <View pointerEvents="none" style={styles.readyOverlay}>
                <Text style={styles.readyText}>{t(S.lobby.getReady)}</Text>
              </View>
            ) : null}

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              inverted
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.chatList}
              renderItem={({ item }) => (
                <ChatBubble
                  msg={item}
                  isMine={item.author === user.nickname}
                  brandRed={colors.brandRed}
                  brandPurple={colors.brandPurple}
                  mutedText={colors.lobbyChatMuted}
                  inputBg={colors.lobbyChatInput}
                />
              )}
            />

            <View
              style={[
                styles.composer,
                {
                  borderTopColor: colors.brandPurple,
                  paddingBottom: Math.max(insets.bottom, 8) + 6,
                },
              ]}
            >
              <View
                style={[
                  styles.composerInputWrap,
                  { backgroundColor: colors.lobbyChatInput },
                ]}
              >
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={t(S.lobby.sendPlaceholder)}
                  placeholderTextColor={colors.lobbyChatMuted}
                  style={styles.composerInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
              </View>
              <Pressable
                onPress={handleSend}
                disabled={!draft.trim()}
                style={({ pressed }) => [
                  styles.sendBtn,
                  {
                    backgroundColor: draft.trim()
                      ? colors.brandRed
                      : colors.brandPurple,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ProfilePanel
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        nickname={user.nickname}
        avatarUri={user.avatarUri ?? null}
        onLogout={handleLogoutFromPanel}
        onAvatarPress={handleProfilePhoto}
      />

      {/* Connection chooser modal */}
      <Modal
        visible={seatSelector !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSeatSelector(null)}
        statusBarTranslucent
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setSeatSelector(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              modalStyles.card,
              {
                backgroundColor: colors.panelBg,
                borderColor: colors.brandPurple,
              },
            ]}
          >
            <Text
              style={[
                modalStyles.cardTitle,
                { color: colors.panelText },
              ]}
            >
              {t(S.lobby.chooseHow)}
              {seatSelector ?? ""}
            </Text>
            <View style={modalStyles.btnRow}>
              <Pressable
                onPress={() =>
                  seatSelector !== null && handleJoinSeat(seatSelector, true)
                }
                style={({ pressed }) => [
                  modalStyles.choiceBtn,
                  {
                    backgroundColor: colors.brandRed,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather name="video" size={22} color="#fff" />
                <Text style={modalStyles.choiceText}>
                  {t(S.lobby.cameraOn)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  seatSelector !== null && handleJoinSeat(seatSelector, false)
                }
                style={({ pressed }) => [
                  modalStyles.choiceBtn,
                  {
                    backgroundColor: colors.brandPurple,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather name="mic" size={22} color="#fff" />
                <Text style={modalStyles.choiceText}>
                  {t(S.lobby.micOnly)}
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => setSeatSelector(null)}
              style={modalStyles.cancelBtn}
            >
              <Text
                style={[
                  modalStyles.cancelText,
                  { color: colors.panelMuted },
                ]}
              >
                {t(S.common.cancel)}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Moderation menu modal */}
      <Modal
        visible={moderation !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModeration}
        statusBarTranslucent
      >
        <Pressable style={modalStyles.overlay} onPress={closeModeration}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              modalStyles.card,
              {
                backgroundColor: colors.panelBg,
                borderColor: colors.brandRed,
              },
            ]}
          >
            <Text
              style={[
                modalStyles.cardTitle,
                { color: colors.panelText },
              ]}
            >
              {t(S.lobby.moderation)} — {moderationOccupant?.name ?? ""}
            </Text>
            <View style={modalStyles.actionList}>
              <ActionRow
                icon="mic-off"
                label={
                  moderationOccupant?.micMuted
                    ? t(S.lobby.unmute)
                    : t(S.lobby.mute)
                }
                color={colors.brandOrange}
                onPress={() => moderationAction("mute")}
              />
              <ActionRow
                icon="user-x"
                label={t(S.lobby.kick)}
                color={colors.brandOrange}
                onPress={() => moderationAction("kick")}
              />
              <ActionRow
                icon="slash"
                label={t(S.lobby.block)}
                color={colors.brandRed}
                onPress={() => moderationAction("block")}
              />
              <ActionRow
                icon="x-octagon"
                label={t(S.lobby.ban)}
                color={colors.brandRed}
                onPress={() => moderationAction("ban")}
              />
            </View>
            <Pressable
              onPress={closeModeration}
              style={modalStyles.cancelBtn}
            >
              <Text
                style={[
                  modalStyles.cancelText,
                  { color: colors.panelMuted },
                ]}
              >
                {t(S.common.cancel)}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface ActionRowProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
  onPress: () => void;
}

function ActionRow({ icon, label, color, onPress }: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        modalStyles.actionRow,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Feather name={icon} size={18} color={color} />
      <Text style={[modalStyles.actionLabel, { color }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={color} />
    </Pressable>
  );
}

interface CameraSlotProps {
  seat: Seat;
  isArmed: boolean;
  swapMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  borderColor: string;
  activeBorderColor: string;
  armedColor: string;
  tileBg: string;
  mutedText: string;
  hostBadgeBg: string;
  seatLabel: string;
}

function CameraSlot({
  seat,
  isArmed,
  swapMode,
  onPress,
  onLongPress,
  borderColor,
  activeBorderColor,
  armedColor,
  tileBg,
  mutedText,
  hostBadgeBg,
  seatLabel,
}: CameraSlotProps) {
  const occ = seat.occupant;
  const isHost = !!occ?.isHost;

  let outerBorder = borderColor;
  let outerBorderWidth = 1;
  if (isArmed) {
    outerBorder = armedColor;
    outerBorderWidth = 3;
  } else if (isHost) {
    outerBorder = activeBorderColor;
    outerBorderWidth = 2;
  } else if (swapMode) {
    outerBorder = activeBorderColor;
    outerBorderWidth = 1.5;
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: tileBg,
          borderColor: outerBorder,
          borderWidth: outerBorderWidth,
          opacity: pressed ? 0.9 : 1,
          transform: isArmed ? [{ scale: 1.04 }] : undefined,
        },
      ]}
    >
      {/* Content */}
      {isHost && occ?.hasCamera ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="front"
          mute={!occ.hasMic || occ.micMuted}
        />
      ) : occ ? (
        occ.avatarUri ? (
          <Image
            source={{ uri: occ.avatarUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.tileInitialWrap,
              { backgroundColor: occ.color },
            ]}
          >
            <Text style={styles.tileInitial}>{occ.initial}</Text>
            {!occ.hasCamera ? (
              <Feather
                name="mic"
                size={14}
                color="rgba(255,255,255,0.85)"
                style={styles.micGlyph}
              />
            ) : null}
          </View>
        )
      ) : (
        <View style={styles.tilePlaceholder}>
          <Feather name="plus" size={20} color={mutedText} />
          <Text
            style={[styles.tileSeat, { color: mutedText }]}
            numberOfLines={2}
          >
            {seatLabel} {seat.number}
          </Text>
        </View>
      )}

      {/* Mic-muted overlay badge */}
      {occ?.micMuted ? (
        <View style={styles.muteBadge}>
          <Feather name="mic-off" size={10} color="#fff" />
        </View>
      ) : null}

      <View style={styles.tileFooter}>
        <Text style={styles.tileNumber}>#{seat.number}</Text>
        {occ?.isHost ? (
          <View
            style={[
              styles.hostBadge,
              { backgroundColor: hostBadgeBg },
            ]}
          >
            <View style={styles.liveDot} />
            <Text style={styles.hostBadgeText} numberOfLines={1}>
              HOST
            </Text>
          </View>
        ) : occ ? (
          <Text style={styles.occName} numberOfLines={1}>
            {occ.name}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

interface ChatBubbleProps {
  msg: ChatMsg;
  isMine: boolean;
  brandRed: string;
  brandPurple: string;
  mutedText: string;
  inputBg: string;
}

function ChatBubble({
  msg,
  isMine,
  brandRed,
  brandPurple,
  mutedText,
  inputBg,
}: ChatBubbleProps) {
  if (msg.system) {
    if (!msg.text) return null;
    return (
      <View style={styles.systemRow}>
        <Text style={[styles.systemText, { color: mutedText }]}>
          {msg.text}
        </Text>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.bubbleRow,
        { justifyContent: isMine ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isMine ? brandRed : inputBg,
            borderColor: isMine ? brandRed : brandPurple,
            borderTopRightRadius: isMine ? 4 : 14,
            borderTopLeftRadius: isMine ? 14 : 4,
          },
        ]}
      >
        {!isMine ? (
          <Text style={styles.bubbleAuthor}>{msg.author}</Text>
        ) : null}
        <Text style={styles.bubbleText}>{msg.text}</Text>
      </View>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  choiceText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  cancelBtn: {
    paddingVertical: 6,
    alignItems: "center",
  },
  cancelText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  actionList: {
    gap: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  actionLabel: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  headerInline: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 12,
  },
  gridShellOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  gridShell: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 800,
    maxHeight: 800,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
  },
  tile: {
    width: "23%",
    aspectRatio: 0.78,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  tilePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  tileSeat: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  tileInitialWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  tileInitial: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#fff",
  },
  micGlyph: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  muteBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(207,58,79,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    gap: 4,
  },
  tileNumber: {
    fontSize: 10,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  hostBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    maxWidth: "70%",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  hostBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  occName: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  armBanner: {
    position: "absolute",
    bottom: -8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "92%",
  },
  armBannerText: {
    color: "#0a0a0a",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  chatWrap: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  chatHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatTitle: {
    color: "#f4f4f6",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    fontSize: 12,
  },
  addDemoBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  addDemoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  chatCount: {
    color: "#86868f",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  readyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
    paddingHorizontal: 20,
  },
  readyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 44,
    letterSpacing: 1.5,
    color: "rgba(60, 220, 110, 0.32)",
    textAlign: "center",
    textShadowColor: "rgba(60, 220, 110, 0.55)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  chatList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  systemRow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  systemText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    textAlign: "center",
  },
  bubbleRow: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  bubbleAuthor: {
    color: "#f4f4f6",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  bubbleText: {
    color: "#f4f4f6",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 18,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerInputWrap: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
  },
  composerInput: {
    color: "#f4f4f6",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
