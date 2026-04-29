import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MafiaXLogo } from "./MafiaXLogo";

interface Props {
  background?: string;
  variant?: "light" | "dark";
  borderColor?: string;
  style?: ViewStyle;
}

export function BrandHeader({
  background = "transparent",
  variant = "light",
  borderColor,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: background,
          paddingTop: topPad + 12,
          borderBottomColor: borderColor ?? "transparent",
          borderBottomWidth: borderColor ? StyleSheet.hairlineWidth : 0,
        },
        style,
      ]}
    >
      <MafiaXLogo size="md" variant={variant} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 14,
  },
});
