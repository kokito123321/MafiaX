import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { XCoin } from "@/components/XCoin";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  amount: number;
  onClose: () => void;
}

export function GiftModal({ visible, amount, onClose }: Props) {
  const colors = useColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.panelBg,
              borderColor: colors.brandRed,
            },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.tag,
                {
                  backgroundColor: colors.brandRed,
                },
              ]}
            >
              <Feather name="bell" size={11} color="#fff" />
              <Text style={styles.tagText}>NEWS</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.panelSurface },
              ]}
            >
              <Feather name="x" size={14} color={colors.panelText} />
            </Pressable>
          </View>

          <View style={styles.giftIconWrap}>
            <View
              style={[
                styles.giftRing,
                { borderColor: colors.brandOrange },
              ]}
            >
              <View
                style={[
                  styles.giftInner,
                  { backgroundColor: colors.brandPurple },
                ]}
              >
                <Feather name="gift" size={36} color="#fff" />
              </View>
            </View>
          </View>

          <Text
            style={[
              styles.title,
              { color: colors.panelText },
            ]}
          >
            გილოცავ!
          </Text>
          <Text
            style={[
              styles.message,
              { color: colors.panelMuted },
            ]}
          >
            თქვენ გადმოგეცათ რეგისტრაციის საჩუქარი
          </Text>

          <View
            style={[
              styles.amountPill,
              {
                borderColor: colors.brandPurple,
                backgroundColor: colors.panelSurface,
              },
            ]}
          >
            <XCoin size={22} />
            <Text style={[styles.amountText, { color: colors.brandOrange }]}>
              {amount} X coin
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: colors.brandRed,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.ctaText}>მადლობა</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  giftIconWrap: {
    marginTop: 6,
  },
  giftRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    padding: 6,
  },
  giftInner: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 4,
  },
  message: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  amountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  amountText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cta: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  ctaText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
