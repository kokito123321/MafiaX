import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GiftModal } from "@/components/GiftModal";
import { MafiaXLogo } from "@/components/MafiaXLogo";
import { ProfilePanel } from "@/components/ProfilePanel";
import { XCoin } from "@/components/XCoin";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  ROOM_ENTRY_FEE,
  useGame,
  type Room,
} from "@/contexts/GameContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function RoomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, S } = useLanguage();
  const { user, logout } = useAuth();
  const {
    balance,
    rooms,
    showGiftModal,
    giftAmount,
    dismissGiftModal,
    refreshRooms,
    createRoom,
    joinRoom,
  } = useGame();
  const [profileOpen, setProfileOpen] = useState(false);

  React.useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return undefined;
      refreshRooms().catch(() => {
        // Keep the existing list if the API is temporarily unavailable.
      });
      return undefined;
    }, [refreshRooms, user]),
  );

  const showInsufficientBalance = useCallback(() => {
    Alert.alert(
      t(S.rooms.insufficientTitle),
      t(S.rooms.insufficientBody),
      [
        { text: t(S.common.cancel), style: "cancel" },
        {
          text: t(S.rooms.topUp),
          onPress: () => router.push("/shop"),
        },
      ],
    );
  }, [t, S]);

  const handleLogout = useCallback(async () => {
    setProfileOpen(false);
    await logout();
    router.replace("/");
  }, [logout]);

  const handleProfilePhoto = useCallback(() => {
    setProfileOpen(false);
    router.push("/profile");
  }, []);

  const handleEnterRoom = useCallback(
    async (room: Room) => {
      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
      try {
        await joinRoom(room.id);
        router.push({ pathname: "/lobby", params: { roomId: room.id } });
      } catch (error) {
        if (
          error instanceof ApiError &&
          (error.status === 402 || error.code === "insufficient_balance")
        ) {
          showInsufficientBalance();
          return;
        }
        Alert.alert(t(S.common.error), t(S.common.error));
      }
    },
    [joinRoom, showInsufficientBalance, t, S],
  );

  const handleCreateRoom = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const room = await createRoom();
      router.push({ pathname: "/lobby", params: { roomId: room.id } });
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 402 || error.code === "insufficient_balance")
      ) {
        showInsufficientBalance();
        return;
      }
      Alert.alert(t(S.common.error), t(S.common.error));
    }
  }, [createRoom, showInsufficientBalance, t, S]);

  const handleOpenShop = useCallback(() => {
    router.push("/shop");
  }, []);

  if (!user) return null;

  const initial = (user.nickname.charAt(0) ?? "U").toUpperCase();
  const topPad = Math.max(insets.top, 16);

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 10 },
        ]}
      >
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
              style={styles.avatarImageWrap}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.avatarBtnText}>{initial}</Text>
          )}
        </Pressable>

        <View style={styles.rightCluster}>
          <Pressable
            onPress={handleCreateRoom}
            hitSlop={6}
            style={({ pressed }) => [
              styles.plusBtn,
              {
                backgroundColor: colors.panelSurface,
                borderColor: colors.brandPurple,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.plusBgText,
                { color: colors.brandPurpleSoft },
              ]}
            >
              {t(S.rooms.roomBtn)}
            </Text>
            <View style={styles.plusIconWrap}>
              <Feather name="plus" size={22} color={colors.brandRed} />
            </View>
          </Pressable>

          <Pressable
            onPress={handleOpenShop}
            hitSlop={6}
            style={({ pressed }) => [
              styles.balancePill,
              {
                backgroundColor: colors.panelSurface,
                borderColor: colors.brandPurple,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <XCoin size={28} />
            <Text style={[styles.balanceText, { color: colors.brandOrange }]}>
              {balance}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.heroLogoBlock}>
        <MafiaXLogo size="hero" variant="dark" />
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.titleText, { color: colors.text }]}>
          {t(S.rooms.title)}
        </Text>
        <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>
          {rooms.length} {t(S.rooms.activeRooms)} • {t(S.rooms.entryFee)}{" "}
          {ROOM_ENTRY_FEE} X coin
        </Text>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RoomCard room={item} onPress={() => handleEnterRoom(item)} />
        )}
      />

      <ProfilePanel
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        nickname={user.nickname}
        avatarUri={user.avatarUri ?? null}
        onLogout={handleLogout}
        onAvatarPress={handleProfilePhoto}
        side="left"
      />

      <GiftModal
        visible={showGiftModal}
        amount={giftAmount}
        onClose={dismissGiftModal}
      />
    </View>
  );
}

interface RoomCardProps {
  room: Room;
  onPress: () => void;
}

function RoomCard({ room, onPress }: RoomCardProps) {
  const colors = useColors();
  const { t, S } = useLanguage();
  const initial = (room.hostNickname.charAt(0) ?? "?").toUpperCase();
  const isFull = room.players >= room.capacity;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.brandPurple,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.cardAvatar,
          { backgroundColor: colors.brandPurple, borderColor: colors.brandRed },
        ]}
      >
        <Text style={styles.cardAvatarText}>{initial}</Text>
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.cardTopRow}>
          <Text
            style={[styles.cardTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {room.name}
          </Text>
          {room.isLive ? (
            <View
              style={[
                styles.statusTag,
                { backgroundColor: colors.brandRed },
              ]}
            >
              <View style={styles.liveDot} />
              <Text style={styles.statusTagText}>{t(S.rooms.live)}</Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: colors.mutedForeground,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusTagText,
                  { color: colors.mutedForeground },
                ]}
              >
                {t(S.rooms.afk)}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.cardHost, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {t(S.rooms.host)}: {room.hostNickname} • {room.region}
        </Text>

        <View style={styles.cardMetaRow}>
          <View style={styles.metaChip}>
            <Feather name="users" size={12} color={colors.brandOrange} />
            <Text
              style={[
                styles.metaText,
                {
                  color: isFull ? colors.brandRed : colors.text,
                },
              ]}
            >
              {room.players}/{room.capacity}
            </Text>
          </View>
          <View style={styles.metaChip}>
            <XCoin size={14} />
            <Text style={[styles.metaText, { color: colors.brandOrange }]}>
              {room.entryFee}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardCta}>
        <Feather name="chevron-right" size={20} color={colors.brandRed} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarImageWrap: {
    width: "100%",
    height: "100%",
    borderRadius: 21,
    overflow: "hidden",
  },
  avatarBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  plusBtn: {
    height: 42,
    minWidth: 78,
    borderRadius: 21,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  plusBgText: {
    position: "absolute",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 1.5,
    opacity: 0.32,
    textTransform: "lowercase",
  },
  plusIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  balancePill: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  heroLogoBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  titleBlock: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 4,
  },
  titleText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  subtitleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 14,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  cardAvatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  statusTagText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  cardHost: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  cardCta: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
