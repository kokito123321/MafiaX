import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguagePicker } from "@/components/LanguagePicker";
import { MafiaXLogo } from "@/components/MafiaXLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, S } = useLanguage();
  const { user, initializing, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (!initializing && user) {
      router.replace("/rooms");
    }
  }, [initializing, user]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t(S.login.needCreds));
      return;
    }
    setSubmitting(true);
    try {
      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
      await login(email, password);
      router.replace("/rooms");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t(S.common.error);
      Alert.alert(t(S.common.error), msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      router.replace("/rooms");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t(S.common.error);
      Alert.alert(t(S.common.error), msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return (
      <View
        style={[
          styles.loader,
          { backgroundColor: colors.loginBackground },
        ]}
      >
        <ActivityIndicator color={colors.brandRed} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.loginBackground }]}>
      <View
        style={[
          styles.langCorner,
          { top: Math.max(insets.top, 16) + 4 },
        ]}
      >
        <LanguagePicker
          surfaceColor={colors.loginInputBg}
          borderColor={colors.loginInputBorder}
          textColor={colors.text}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: Math.max(insets.top, 32) + 56,
              paddingBottom: Math.max(insets.bottom, 24) + 60,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBlock}>
            <MafiaXLogo size="hero" variant="dark" />
            <View style={styles.welcomeRow}>
              <Text style={[styles.welcomeText, { color: colors.loginMuted }]}>
                WELCOME TO{" "}
              </Text>
              <Text
                style={[
                  styles.welcomeText,
                  {
                    color: colors.brandPurpleSoft,
                    fontFamily: "Inter_700Bold",
                  },
                ]}
              >
                mafia
              </Text>
              <Text
                style={[
                  styles.welcomeText,
                  {
                    color: colors.brandRed,
                    fontFamily: "Inter_700Bold",
                    fontSize: 16,
                  },
                ]}
              >
                "X"
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleGoogle}
            disabled={submitting}
            style={({ pressed }) => [
              styles.googleBtn,
              {
                borderColor: colors.loginInputBorder,
                backgroundColor: colors.loginInputBg,
                opacity: pressed || submitting ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.googleIconWrap}>
              <GoogleGlyph />
            </View>
            <Text style={styles.googleText}>{t(S.login.google)}</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View
              style={[styles.divider, { backgroundColor: colors.loginInputBorder }]}
            />
            <Text style={[styles.dividerText, { color: colors.loginMuted }]}>
              {t(S.login.or)}
            </Text>
            <View
              style={[styles.divider, { backgroundColor: colors.loginInputBorder }]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.loginMuted }]}>
              {t(S.login.email)}
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: colors.loginInputBorder,
                  backgroundColor: colors.loginInputBg,
                },
              ]}
            >
              <Feather name="mail" size={18} color={colors.loginMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="MAIL"
                placeholderTextColor={colors.loginPlaceholder}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.loginMuted }]}>
              {t(S.login.password)}
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: colors.loginInputBorder,
                  backgroundColor: colors.loginInputBg,
                },
              ]}
            >
              <Feather name="lock" size={18} color={colors.loginMuted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.loginPlaceholder}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: colors.text }]}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={colors.loginMuted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleEmailLogin}
            disabled={submitting}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.brandPurple,
                opacity: pressed || submitting ? 0.85 : 1,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>{t(S.login.signIn)}</Text>
            )}
          </Pressable>

          <View style={styles.registerRow}>
            <Pressable
              onPress={() => router.push("/register")}
              hitSlop={8}
            >
              <Text
                style={{
                  color: colors.brandRed,
                  fontFamily: "Inter_700Bold",
                  marginLeft: 6,
                }}
              >
                {t(S.login.register)}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        pointerEvents="none"
        style={[
          styles.poweredWrap,
          { paddingBottom: Math.max(insets.bottom, 12) + 8 },
        ]}
      >
        <Text style={[styles.poweredLabel, { color: colors.loginMuted }]}>
          powered By{" "}
          <Text style={[styles.poweredBrand, { color: colors.brandRed }]}>
            LaSheX
          </Text>
        </Text>
      </View>
    </View>
  );
}

function GoogleGlyph() {
  return (
    <View style={glyphStyles.wrap}>
      <Text style={glyphStyles.text}>G</Text>
    </View>
  );
}

const glyphStyles = StyleSheet.create({
  wrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#0a0a0a",
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  langCorner: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 18,
  },
  heroBlock: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    gap: 14,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  welcomeText: {
    fontSize: 14,
    letterSpacing: 2,
    fontFamily: "Inter_500Medium",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
  },
  googleIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  googleText: {
    color: "#f4f4f6",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  fieldGroup: { gap: 8 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  primaryBtn: {
    marginTop: 6,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  poweredWrap: {
    position: "absolute",
    left: 16,
    bottom: 0,
  },
  poweredLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
  },
  poweredBrand: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
});
