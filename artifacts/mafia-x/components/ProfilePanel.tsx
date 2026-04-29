import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface ProfilePanelProps {
  visible: boolean;
  onClose: () => void;
  nickname: string;
  onLogout: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}

const MENU: MenuItem[] = [
  { key: "stats", label: "ჩემი სტატისტიკა", icon: "bar-chart-2" },
  { key: "settings", label: "პარამეტრები", icon: "settings" },
  { key: "referral", label: "რეფერალ პროგრამა", icon: "gift" },
  { key: "connection", label: "შეამოწმე ქონექშენი", icon: "wifi" },
  { key: "rate", label: "თამაშის შეფასება", icon: "star" },
  { key: "rules", label: "თამაშის წესები", icon: "book-open" },
  { key: "news", label: "სიახლეები", icon: "bell" },
];

export function ProfilePanel({
  visible,
  onClose,
  nickname,
  onLogout,
}: ProfilePanelProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const screenW = Dimensions.get("window").width;
  const panelW = Math.max(Math.round(screenW * 0.5), 280);

  const slide = useRef(new Animated.Value(panelW)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: panelW,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, panelW, slide, fade]);

  const initial = (nickname?.charAt(0) ?? "U").toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.55)", opacity: fade },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              width: panelW,
              backgroundColor: colors.panelBg,
              borderLeftColor: colors.panelBorder,
              transform: [{ translateX: slide }],
              paddingTop: Math.max(insets.top, 16) + 8,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.panelMuted }]}>
              PROFILE
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: colors.panelSurface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="x" size={16} color={colors.panelText} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarBlock}>
              <View
                style={[
                  styles.avatarOuter,
                  { borderColor: colors.brandRed },
                ]}
              >
                <View
                  style={[
                    styles.avatarInner,
                    { backgroundColor: colors.brandPurple },
                  ]}
                >
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              </View>
              <Text
                style={[styles.nickname, { color: colors.brandOrange }]}
                numberOfLines={1}
              >
                {nickname}
              </Text>
            </View>

            <View
              style={[
                styles.rankCard,
                {
                  backgroundColor: colors.panelSurface,
                  borderColor: colors.panelBorder,
                },
              ]}
            >
              <View style={styles.rankRow}>
                <Text style={[styles.rankLabel, { color: colors.panelMuted }]}>
                  წოდება
                </Text>
                <View
                  style={[
                    styles.levelPill,
                    { backgroundColor: colors.brandRed },
                  ]}
                >
                  <Text style={styles.levelText}>დონე 1</Text>
                </View>
              </View>
              <Text style={[styles.rankValue, { color: colors.panelText }]}>
                დამწყები
              </Text>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.panelDivider },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.brandOrange, width: "12%" },
                  ]}
                />
              </View>
            </View>

            <View style={styles.menuList}>
              {MENU.map((item, idx) => (
                <View key={item.key}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      {
                        backgroundColor: pressed
                          ? colors.panelSurface
                          : "transparent",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.menuIconWrap,
                        { backgroundColor: colors.panelSurface },
                      ]}
                    >
                      <Feather
                        name={item.icon}
                        size={16}
                        color={colors.brandOrange}
                      />
                    </View>
                    <Text
                      style={[styles.menuLabel, { color: colors.panelText }]}
                    >
                      {item.label}
                    </Text>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={colors.panelMuted}
                    />
                  </Pressable>
                  {idx < MENU.length - 1 ? (
                    <View
                      style={[
                        styles.menuDivider,
                        { backgroundColor: colors.panelDivider },
                      ]}
                    />
                  ) : null}
                </View>
              ))}
            </View>

            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [
                styles.logoutBtn,
                {
                  borderColor: colors.brandRed,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="log-out" size={16} color={colors.brandRed} />
              <Text style={[styles.logoutText, { color: colors.brandRed }]}>
                გასვლა
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: 24,
    gap: 18,
  },
  avatarBlock: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  avatarOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    color: "#ffffff",
  },
  nickname: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.5,
    maxWidth: 200,
    textAlign: "center",
  },
  rankCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rankLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  levelText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
    color: "#fff",
  },
  rankValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  menuList: {
    borderRadius: 14,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 44,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  logoutText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
