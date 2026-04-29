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

import { BrandHeader } from "@/components/BrandHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const { user, initializing, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (!initializing && user) {
      router.replace("/lobby");
    }
  }, [initializing, user]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("შეიყვანეთ მეილი და პაროლი");
      return;
    }
    setSubmitting(true);
    try {
      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
      await login(email, password);
      router.replace("/lobby");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "ვერ მოხერხდა შესვლა";
      Alert.alert("შეცდომა", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      router.replace("/lobby");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "ვერ მოხერხდა შესვლა";
      Alert.alert("შეცდომა", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return (
      <View
        style={[
          styles.loader,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color={colors.brandRed} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader background={colors.background} variant="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBlock}>
            <View
              style={[
                styles.badge,
                { backgroundColor: "#0a0a0a", borderColor: colors.brandRed },
              ]}
            >
              <Text style={[styles.badgeText, { color: "#fff" }]}>
                ENTER THE FAMILY
              </Text>
            </View>
            <Text style={[styles.title, { color: "#0a0a0a" }]}>
              შემოდი თამაშში
            </Text>
            <Text style={[styles.subtitle, { color: "#5a5a60" }]}>
              გაიარე ავტორიზაცია და დაიკავე ადგილი მაგიდასთან
            </Text>
          </View>

          <Pressable
            onPress={handleGoogle}
            disabled={submitting}
            style={({ pressed }) => [
              styles.googleBtn,
              {
                borderColor: "#0a0a0a",
                opacity: pressed || submitting ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.googleIconWrap}>
              <GoogleGlyph />
            </View>
            <Text style={styles.googleText}>Google-ით შესვლა</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: "#d8d8de" }]} />
            <Text style={[styles.dividerText, { color: "#7a7a82" }]}>ან</Text>
            <View style={[styles.divider, { backgroundColor: "#d8d8de" }]} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>მეილი</Text>
            <View
              style={[
                styles.inputWrap,
                { borderColor: "#0a0a0a", backgroundColor: "#fafafa" },
              ]}
            >
              <Feather name="mail" size={18} color="#0a0a0a" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9a9aa0"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>პაროლი</Text>
            <View
              style={[
                styles.inputWrap,
                { borderColor: "#0a0a0a", backgroundColor: "#fafafa" },
              ]}
            >
              <Feather name="lock" size={18} color="#0a0a0a" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9a9aa0"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#5a5a60"
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
              <Text style={styles.primaryBtnText}>შესვლა</Text>
            )}
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={{ color: "#5a5a60", fontFamily: "Inter_400Regular" }}>
              ჯერ არ გაქვს ანგარიში?
            </Text>
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
                რეგისტრაცია
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderWidth: 1,
    borderColor: "#0a0a0a",
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
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 18,
  },
  heroBlock: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 6,
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    maxWidth: 320,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  googleIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  googleText: {
    color: "#0a0a0a",
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
    color: "#0a0a0a",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
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
    color: "#0a0a0a",
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
});
