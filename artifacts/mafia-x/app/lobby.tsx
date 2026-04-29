import { Feather } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
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
import { useColors } from "@/hooks/useColors";

interface ChatMsg {
  id: string;
  author: string;
  text: string;
  ts: number;
  system?: boolean;
}

const SLOT_COUNT = 10;

const SEAT_NAMES = [
  "Don",
  "Capo",
  "Soldier",
  "Consigliere",
  "Underboss",
  "Made Man",
  "Enforcer",
  "Lookout",
  "Driver",
  "Wiseguy",
];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export default function LobbyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [hostSlot, setHostSlot] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "sys-welcome",
      author: "system",
      text: "მოგესალმებით Mafia X-ში. აირჩიეთ ფანჯარა და გახდით HOST.",
      ts: Date.now(),
      system: true,
    },
  ]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<ChatMsg>>(null);

  React.useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  const handleClaimSlot = useCallback(
    async (idx: number) => {
      if (!user) return;
      if (hostSlot === idx) {
        setHostSlot(null);
        if (Platform.OS !== "web") {
          await Haptics.selectionAsync();
        }
        setMessages((prev) => [
          {
            id: makeId(),
            author: "system",
            text: `${user.nickname}-მ დატოვა ჰოსტის ადგილი #${idx + 1}`,
            ts: Date.now(),
            system: true,
          },
          ...prev,
        ]);
        return;
      }
      let camOk = camPerm?.granted ?? false;
      let micOk = micPerm?.granted ?? false;
      if (!camOk) {
        const r = await requestCamPerm();
        camOk = r.granted;
      }
      if (!micOk) {
        const r = await requestMicPerm();
        micOk = r.granted;
      }
      if (!camOk || !micOk) {
        Alert.alert(
          "უფლებები საჭიროა",
          "კამერისა და მიკროფონის უფლებები აუცილებელია ჰოსტის რეჟიმისთვის.",
        );
        return;
      }
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setHostSlot(idx);
      setMessages((prev) => [
        {
          id: makeId(),
          author: "system",
          text: `${user.nickname} გახდა HOST #${idx + 1}`,
          ts: Date.now(),
          system: true,
        },
        ...prev,
      ]);
    },
    [
      user,
      hostSlot,
      camPerm?.granted,
      micPerm?.granted,
      requestCamPerm,
      requestMicPerm,
    ],
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

  const slots = useMemo(
    () =>
      Array.from({ length: SLOT_COUNT }, (_, i) => ({
        index: i,
        seat: SEAT_NAMES[i] ?? `Seat ${i + 1}`,
      })),
    [],
  );

  if (!user) return null;

  const initial = (user.nickname.charAt(0) ?? "U").toUpperCase();
  const topPad = Math.max(insets.top, 16);

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
            },
          ]}
        >
          <Text style={styles.avatarBtnText}>{initial}</Text>
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
              {slots.map((s) => (
                <CameraSlot
                  key={s.index}
                  index={s.index}
                  seat={s.seat}
                  isHost={hostSlot === s.index}
                  hostNickname={hostSlot === s.index ? user.nickname : null}
                  onPress={() => handleClaimSlot(s.index)}
                  borderColor={colors.brandPurple}
                  activeBorderColor={colors.brandRed}
                  tileBg={colors.lobbyTileBg}
                  mutedText={colors.lobbyChatMuted}
                  hostBadgeBg={colors.brandRed}
                />
              ))}
            </View>
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
                <Text style={styles.chatTitle}>LIVE CHAT</Text>
              </View>
              <Text style={styles.chatCount}>{messages.length}</Text>
            </View>

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
                  placeholder="დაწერე შეტყობინება..."
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
        onLogout={handleLogoutFromPanel}
      />
    </View>
  );
}

interface CameraSlotProps {
  index: number;
  seat: string;
  isHost: boolean;
  hostNickname: string | null;
  onPress: () => void;
  borderColor: string;
  activeBorderColor: string;
  tileBg: string;
  mutedText: string;
  hostBadgeBg: string;
}

function CameraSlot({
  index,
  seat,
  isHost,
  hostNickname,
  onPress,
  borderColor,
  activeBorderColor,
  tileBg,
  mutedText,
  hostBadgeBg,
}: CameraSlotProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: tileBg,
          borderColor: isHost ? activeBorderColor : borderColor,
          borderWidth: isHost ? 2 : 1,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {isHost ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="front"
          mute={false}
        />
      ) : (
        <View style={styles.tilePlaceholder}>
          <Feather name="video-off" size={20} color={mutedText} />
          <Text style={[styles.tileSeat, { color: mutedText }]}>{seat}</Text>
        </View>
      )}

      <View style={styles.tileFooter}>
        <Text style={styles.tileNumber}>#{index + 1}</Text>
        {isHost ? (
          <View
            style={[
              styles.hostBadge,
              { backgroundColor: hostBadgeBg },
            ]}
          >
            <View style={styles.liveDot} />
            <Text style={styles.hostBadgeText} numberOfLines={1}>
              {hostNickname ?? "HOST"}
            </Text>
          </View>
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
    aspectRatio: 0.85,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  tilePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tileSeat: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
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
  },
  chatHeaderLeft: {
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
  chatCount: {
    color: "#86868f",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
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
