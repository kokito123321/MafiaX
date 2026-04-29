import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { XCoin } from "@/components/XCoin";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface PackOption {
  id: string;
  amount: number;
  amountLabel: string;
  priceLabel: string;
  badge?: "popular" | "bestValue" | "sale";
  unlimited?: boolean;
}

const PACKS: PackOption[] = [
  { id: "p1", amount: 300, amountLabel: "300", priceLabel: "4 ₾" },
  { id: "p2", amount: 500, amountLabel: "500", priceLabel: "6 ₾" },
  {
    id: "p3",
    amount: 1000,
    amountLabel: "1,000",
    priceLabel: "10 ₾",
    badge: "popular",
  },
  {
    id: "p4",
    amount: 5000,
    amountLabel: "5,000",
    priceLabel: "12 ₾",
    badge: "bestValue",
  },
  { id: "p5", amount: 10000, amountLabel: "10,000", priceLabel: "30 ₾" },
  {
    id: "p6",
    amount: 0,
    amountLabel: "ULTD",
    priceLabel: "50 ₾",
    unlimited: true,
    badge: "sale",
  },
];

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { balance, addCoins } = useGame();
  const { t, S } = useLanguage();

  React.useEffect(() => {
    if (!user) router.replace("/");
  }, [user]);

  const handleBuy = useCallback(
    (pack: PackOption) => {
      const body = pack.unlimited
        ? `${t(S.shop.confirmUnlimited)} (${t(S.shop.months6)}) ${t(
            S.shop.forPrice,
          )} ${pack.priceLabel}?`
        : `${t(S.shop.confirmCoins)} ${pack.amountLabel} X coin ${t(
            S.shop.forPrice,
          )} ${pack.priceLabel}?`;
      Alert.alert(t(S.shop.confirmTitle), body, [
        { text: t(S.common.cancel), style: "cancel" },
        {
          text: t(S.shop.buyBtn),
          onPress: async () => {
            if (!pack.unlimited && pack.amount > 0) {
              await addCoins(pack.amount);
            }
            Alert.alert(
              t(S.common.success),
              pack.unlimited
                ? t(S.shop.unlimitedActivated)
                : `${pack.amountLabel} ${t(S.shop.creditedDemo)}`,
            );
          },
        },
      ]);
    },
    [addCoins, t, S],
  );

  if (!user) return null;
  const topPad = Math.max(insets.top, 16);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              borderColor: colors.brandPurple,
              backgroundColor: colors.panelSurface,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>

        <View style={{ flex: 1 }} />

        <View
          style={[
            styles.balancePill,
            {
              backgroundColor: colors.panelSurface,
              borderColor: colors.brandPurple,
            },
          ]}
        >
          <XCoin size={32} />
          <Text style={[styles.balanceText, { color: colors.brandOrange }]}>
            {balance}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Image
            source={require("../assets/images/coin-mountain.png")}
            style={styles.heroImage}
            contentFit="contain"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroTitleRow}>
              <Text
                style={[
                  styles.heroTitle,
                  { color: colors.text },
                ]}
              >
                {t(S.shop.titlePrefix)}
              </Text>
              <XCoin size={36} />
              <Text
                style={[
                  styles.heroTitle,
                  { color: colors.brandRed },
                ]}
              >
                X coin
              </Text>
              {t(S.shop.titleSuffix) ? (
                <Text
                  style={[
                    styles.heroTitle,
                    { color: colors.text },
                  ]}
                >
                  {t(S.shop.titleSuffix)}
                </Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.heroSubtitle,
                { color: colors.mutedForeground },
              ]}
            >
              {t(S.shop.subtitle)}
            </Text>
          </View>
        </View>

        <View style={styles.packList}>
          {PACKS.map((pack) => (
            <PackRow key={pack.id} pack={pack} onPress={() => handleBuy(pack)} />
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Feather name="info" size={12} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            {t(S.shop.demoNote)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface PackRowProps {
  pack: PackOption;
  onPress: () => void;
}

const SALE_COLOR = "#ffd633"; // bright yellow, eye-catching, NOT red
const POPULAR_COLOR = "#ff8a3d"; // orange
const BEST_COLOR = "#7a4d9e"; // purple soft

function PackRow({ pack, onPress }: PackRowProps) {
  const colors = useColors();
  const { t, S } = useLanguage();
  const isVip = pack.unlimited;

  const badgeColor = !pack.badge
    ? null
    : pack.badge === "sale"
      ? SALE_COLOR
      : pack.badge === "popular"
        ? POPULAR_COLOR
        : BEST_COLOR;
  const badgeTextColor = pack.badge === "sale" ? "#0a0a0a" : "#fff";
  const badgeLabel = !pack.badge
    ? ""
    : pack.badge === "sale"
      ? t(S.shop.sale)
      : pack.badge === "popular"
        ? t(S.shop.popular)
        : t(S.shop.bestValue);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.packRow,
        {
          backgroundColor: isVip ? colors.brandPurple : colors.card,
          borderColor: isVip ? SALE_COLOR : colors.brandPurple,
          borderWidth: isVip ? 2 : 1.5,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {pack.badge ? (
        <View
          style={[
            styles.cornerBadge,
            { backgroundColor: badgeColor ?? colors.brandOrange },
          ]}
        >
          <Text
            style={[
              styles.cornerBadgeText,
              { color: badgeTextColor },
            ]}
          >
            {badgeLabel}
          </Text>
        </View>
      ) : null}

      <View style={styles.packLeft}>
        <XCoin size={32} />
        <View style={styles.packLabels}>
          <View style={styles.packAmountRow}>
            {pack.unlimited ? (
              <Text
                style={[
                  styles.packAmount,
                  { color: "#fff" },
                ]}
              >
                {t(S.shop.unlimited)}
              </Text>
            ) : (
              <>
                <Text
                  style={[
                    styles.packAmount,
                    { color: isVip ? "#fff" : colors.text },
                  ]}
                >
                  {pack.amountLabel}
                </Text>
                <Text
                  style={[
                    styles.packUnit,
                    { color: isVip ? "#fff" : colors.brandOrange },
                  ]}
                >
                  X coin
                </Text>
              </>
            )}
          </View>
          {pack.unlimited ? (
            <Text
              style={[
                styles.packDuration,
                { color: "#fff" },
              ]}
            >
              {t(S.shop.months6)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.packRight}>
        <Text
          style={[
            styles.packPrice,
            { color: isVip ? "#fff" : colors.text },
          ]}
        >
          {pack.priceLabel}
        </Text>
        <Feather
          name="chevron-right"
          size={18}
          color={isVip ? "#fff" : colors.brandRed}
        />
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
    paddingBottom: 6,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  balancePill: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 18,
  },
  heroBlock: {
    height: 240,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  heroOverlay: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    gap: 6,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "center",
  },
  packList: {
    gap: 10,
  },
  packRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    position: "relative",
    overflow: "hidden",
  },
  cornerBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  cornerBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  packLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  packLabels: {
    gap: 4,
    flex: 1,
  },
  packAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  packAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  packUnit: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  packDuration: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  packRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 8,
  },
  packPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  disclaimerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    flex: 1,
  },
});
