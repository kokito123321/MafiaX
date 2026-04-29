import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "light" | "dark";

interface Props {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  variant?: Variant;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { font: 18, gap: 1, letter: 1.5, xMul: 1.05 },
  md: { font: 24, gap: 2, letter: 2, xMul: 1.05 },
  lg: { font: 36, gap: 3, letter: 3, xMul: 1.1 },
  xl: { font: 56, gap: 4, letter: 4, xMul: 1.2 },
  hero: { font: 72, gap: 6, letter: 5, xMul: 1.5 },
};

export function MafiaXLogo({ size = "md", variant = "light", style }: Props) {
  const colors = useColors();
  const { font, gap, letter, xMul } = sizeMap[size];

  const mafiaColor =
    variant === "light" ? colors.brandPurple : colors.brandPurpleSoft;
  const xColor = colors.brandRed;

  return (
    <View style={[styles.row, { gap }, style]}>
      <Text
        style={{
          color: mafiaColor,
          fontSize: font,
          fontFamily: "Inter_700Bold",
          letterSpacing: letter,
          includeFontPadding: false,
          textShadowColor: "rgba(0,0,0,0.35)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}
      >
        MAFIA
      </Text>
      <Text
        style={{
          color: xColor,
          fontSize: font * xMul,
          fontFamily: "Inter_700Bold",
          letterSpacing: letter,
          includeFontPadding: false,
          textShadowColor: "rgba(220,20,60,0.45)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        }}
      >
        X
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
  },
});
