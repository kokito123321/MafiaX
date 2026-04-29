import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  size?: number;
  style?: ViewStyle;
}

export function XCoin({ size = 16, style }: Props) {
  const colors = useColors();
  const innerSize = size - 4;
  return (
    <View
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.brandPurple,
          borderColor: colors.brandPurpleSoft,
        },
        style,
      ]}
    >
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: colors.brandPurple,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(255,255,255,0.18)",
        }}
      >
        <Text
          style={{
            color: colors.brandRed,
            fontFamily: "Inter_700Bold",
            fontSize: Math.max(8, size * 0.55),
            includeFontPadding: false,
            lineHeight: Math.max(9, size * 0.6),
          }}
        >
          X
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
