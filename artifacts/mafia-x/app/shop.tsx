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
import { useColors } from "@/hooks/useColors";

interface PackOption {
  id: string;
  amount: number;
  amountLabel: string;
  priceLabel: string;
  badge?: string;
  unlimited?: boolean;
  durationLabel?: string;
}

const PACKS: PackOption[] = [
  { id: "p1", amount: 300, amountLabel: "300", priceLabel: "4 ₾" },
  { id: "p2", amount: 500, amountLabel: "500", priceLabel: "6 ₾" },
  {
    id: "p3",
    amount: 1000,
    amountLabel: "1,000",
    priceLabel: "10 ₾",
    badge: "POPULAR",
  },
  { id: "p4", amount: 5000, amountLabel: "5,000", priceLabel: "12 ₾", badge: "BEST VALUE" },
  { id: "p5", amount: 10000, amountLabel: "10,000", priceLabel: "30 ₾" },
  {
    id: "p6",
    amount: 0,
    amountLabel: "ულიმიტო",
    priceLabel: "50 ₾",
    durationLabel: "6 თვე",
    unlimited: true,
    badge: "VIP",
  },
];

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { balance, addCoins } = useGame();

  React.useEffect(() => {
    if (!user) router.replace("/");
  }, [user]);

  const handleBuy = useCallback(
    (pack: PackOption) => {
      Alert.alert(
        "შეძენის დადასტურება",
        pack.unlimited
          ? `გსურს შეიძინო ულიმიტო პაკეტი (${pack.durationLabel}) ფასად ${pack.priceLabel}?`
          : `გსურს შეიძინო ${pack.amountLabel} X coin ფასად ${pack.priceLabel}?`,
        [
          { text: "გაუქმება", style: "cancel" },
          {
            text: "შეძენა",
            onPress: async () => {
              if (!pack.unlimited && pack.amount > 0) {
                await addCoins(pack.amount);
              }
              Alert.alert(
                "წარმატება",
                pack.unlimited
                  ? "ულიმიტო პაკეტი გააქტიურდა (ნიმუშის რეჟიმი)."
                  : `${pack.amountLabel} X coin დაგერიცხა (ნიმუშის რეჟიმი).`,
              );
            },
          },
        ],
      );
    },
    [addCoins],
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

        <View style={styles.balanceWrap}>
          <XCoin size={22} />
          <Text
            style={[
              styles.balanceText,
              { color: colors.brandOrange },
            ]}
          >
            {balance}
          </Text>
        </View>

        <View style={{ width: 38 }} />
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
                შეისყიდე
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
              <Text
                style={[
                  styles.heroTitle,
                  { color: colors.text },
                ]}
              >
                ები
              </Text>
            </View>
            <Text
              style={[
                styles.heroSubtitle,
                { color: colors.mutedForeground },
              ]}
            >
              აირჩიე პაკეტი და განაგრძე თამაში
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
            ფასები ნაჩვენებია ნიმუშის სახით. რეალური გადახდა ჯერ არ არის ჩართული.
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

function PackRow({ pack, onPress }: PackRowProps) {
  const colors = useColors();
  const isVip = pack.unlimited;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.packRow,
        {
          backgroundColor: isVip ? colors.brandPurple : colors.card,
          borderColor: isVip ? colors.brandRed : colors.brandPurple,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.packLeft}>
        <XCoin size={32} />
        <View style={styles.packLabels}>
          <View style={styles.packAmountRow}>
            <Text
              style={[
                styles.packAmount,
                { color: isVip ? "#fff" : colors.text },
              ]}
            >
              {pack.amountLabel}
            </Text>
            {!pack.unlimited ? (
              <Text
                style={[
                  styles.packUnit,
                  { color: isVip ? "#fff" : colors.brandOrange },
                ]}
              >
                X coin
              </Text>
            ) : null}
          </View>
          {pack.durationLabel ? (
            <Text
              style={[
                styles.packDuration,
                { color: isVip ? "#fff" : colors.mutedForeground },
              ]}
            >
              {pack.durationLabel}
            </Text>
          ) : null}
          {pack.badge ? (
            <View
              style={[
                styles.packBadge,
                {
                  backgroundColor: isVip
                    ? colors.brandRed
                    : colors.brandOrange,
                },
              ]}
            >
              <Text style={styles.packBadgeText}>{pack.badge}</Text>
            </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  balanceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 18,
  },
  heroBlock: {
    height: 220,
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
    borderWidth: 1.5,
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
  packBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 2,
  },
  packBadgeText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1,
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
