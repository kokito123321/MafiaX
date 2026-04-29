import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "light" | "dark";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: Variant;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { font: 18, gap: 1, letter: 1.5 },
  md: { font: 24, gap: 2, letter: 2 },
  lg: { font: 36, gap: 3, letter: 3 },
  xl: { font: 56, gap: 4, letter: 4 },
};

export function MafiaXLogo({ size = "md", variant = "light", style }: Props) {
  const colors = useColors();
  const { font, gap, letter } = sizeMap[size];

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
        }}
      >
        MAFIA
      </Text>
      <Text
        style={{
          color: xColor,
          fontSize: font * 1.05,
          fontFamily: "Inter_700Bold",
          letterSpacing: letter,
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
    alignItems: "center",
  },
});
