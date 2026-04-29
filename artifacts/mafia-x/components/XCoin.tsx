import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  size?: number;
  style?: ViewStyle;
}

export function XCoin({ size = 22, style }: Props) {
  const colors = useColors();
  const rimSize = size;
  const faceSize = Math.max(8, size - 4);
  const highlightSize = Math.max(4, Math.round(size * 0.32));

  return (
    <View
      style={[
        {
          width: rimSize,
          height: rimSize,
          borderRadius: rimSize / 2,
        },
        styles.shadow,
        style,
      ]}
    >
      <LinearGradient
        colors={["#a37bcc", "#5a3a72", "#1f0e2a"]}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.85, y: 0.9 }}
        style={{
          width: rimSize,
          height: rimSize,
          borderRadius: rimSize / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LinearGradient
          colors={["#5a3a72", "#3a1f4d", "#1c0d28"]}
          start={{ x: 0.2, y: 0.15 }}
          end={{ x: 0.85, y: 0.9 }}
          style={{
            width: faceSize,
            height: faceSize,
            borderRadius: faceSize / 2,
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
              fontSize: Math.max(8, faceSize * 0.62),
              includeFontPadding: false,
              lineHeight: Math.max(9, faceSize * 0.72),
              textShadowColor: "rgba(0,0,0,0.55)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            X
          </Text>

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: faceSize * 0.12,
              left: faceSize * 0.18,
              width: highlightSize,
              height: highlightSize * 0.55,
              borderRadius: highlightSize,
              backgroundColor: "rgba(255,255,255,0.55)",
              transform: [{ rotate: "-30deg" }],
              opacity: 0.85,
            }}
          />
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
    elevation: 4,
  },
});
