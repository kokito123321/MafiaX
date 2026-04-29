import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
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
import { useAuth } from "@/contexts/AuthContext";
import { useGame, type Room } from "@/contexts/GameContext";
import { useColors } from "@/hooks/useColors";

export default function RoomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const {
    balance,
    rooms,
    showGiftModal,
    giftAmount,
    dismissGiftModal,
    createRoom,
  } = useGame();
  const [profileOpen, setProfileOpen] = useState(false);

  React.useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  const handleLogout = useCallback(async () => {
    setProfileOpen(false);
    await logout();
    router.replace("/");
  }, [logout]);

  const handleEnterRoom = useCallback(async (_room: Room) => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    router.push("/lobby");
  }, []);

  const handleCreateRoom = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    createRoom();
    router.push("/lobby");
  }, [createRoom]);

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
          { paddingTop: topPad + 8 },
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
            },
          ]}
        >
          <Text style={styles.avatarBtnText}>{initial}</Text>
        </Pressable>

        <View style={styles.brandWrap}>
          <MafiaXLogo size="md" variant="dark" />
        </View>

        <View style={styles.rightCluster}>
          <Pressable
            onPress={handleCreateRoom}
            hitSlop={8}
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
              room
            </Text>
            <View style={styles.plusIconWrap}>
              <Feather name="plus" size={18} color={colors.brandRed} />
            </View>
          </Pressable>

          <View
            style={[
              styles.balancePill,
              {
                backgroundColor: colors.panelSurface,
                borderColor: colors.brandPurple,
              },
            ]}
          >
            <XCoin size={16} />
            <Text style={[styles.balanceText, { color: colors.brandOrange }]}>
              {balance}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.titleText, { color: colors.text }]}>
          აირჩიე მაგიდა
        </Text>
        <Text style={[styles.subtitleText, { color: colors.mutedForeground }]}>
          {rooms.length} აქტიური ოთახი • შეუერთდი ან შექმენი ახალი
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
        onLogout={handleLogout}
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
                styles.liveTag,
                { backgroundColor: colors.brandRed },
              ]}
            >
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>LIVE</Text>
            </View>
          ) : (
            <View
              style={[
                styles.liveTag,
                {
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: colors.mutedForeground,
                },
              ]}
            >
              <Text
                style={[
                  styles.liveTagText,
                  { color: colors.mutedForeground },
                ]}
              >
                IDLE
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.cardHost, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          host: {room.hostNickname} • {room.region}
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
            <XCoin size={12} />
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
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
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
  brandWrap: {
    flex: 1,
    alignItems: "center",
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  plusBtn: {
    height: 32,
    minWidth: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  plusBgText: {
    position: "absolute",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 1,
    opacity: 0.35,
    textTransform: "lowercase",
  },
  plusIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  balancePill: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  titleBlock: {
    paddingHorizontal: 20,
    paddingTop: 14,
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
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveTagText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1,
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
