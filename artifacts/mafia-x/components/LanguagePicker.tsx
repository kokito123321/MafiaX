import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  style?: ViewStyle;
  surfaceColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function LanguagePicker({
  style,
  surfaceColor,
  borderColor,
  textColor,
}: Props) {
  const colors = useColors();
  const { lang, setLang, langs, t, S } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = langs.find((l) => l.code === lang) ?? langs[0]!;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: surfaceColor ?? colors.panelSurface,
            borderColor: borderColor ?? colors.brandPurple,
            opacity: pressed ? 0.75 : 1,
          },
          style,
        ]}
      >
        <Text style={styles.flag}>{current.flag}</Text>
        <Text
          style={[
            styles.label,
            { color: textColor ?? colors.text },
          ]}
        >
          {current.label}
        </Text>
        <Feather
          name="chevron-down"
          size={14}
          color={textColor ?? colors.text}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.card,
              {
                backgroundColor: colors.panelBg,
                borderColor: colors.panelBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                { color: colors.panelMuted },
              ]}
            >
              {t(S.language.pick)}
            </Text>
            {langs.map((l) => {
              const active = l.code === lang;
              return (
                <Pressable
                  key={l.code}
                  onPress={async () => {
                    await setLang(l.code);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: active
                        ? colors.brandPurple
                        : pressed
                          ? colors.panelSurface
                          : "transparent",
                    },
                  ]}
                >
                  <Text style={styles.rowFlag}>{l.flag}</Text>
                  <Text
                    style={[
                      styles.rowLabel,
                      {
                        color: active ? "#fff" : colors.panelText,
                      },
                    ]}
                  >
                    {l.label}
                  </Text>
                  {active ? (
                    <Feather name="check" size={16} color="#fff" />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  flag: { fontSize: 16 },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  rowFlag: { fontSize: 22 },
  rowLabel: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
