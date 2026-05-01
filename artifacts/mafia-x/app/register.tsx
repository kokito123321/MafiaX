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
import { useAuth, type Gender } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const { register } = useAuth();
  const { t, S } = useLanguage();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      Alert.alert(t(S.register.nickname));
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert(t(S.register.email));
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!Number.isFinite(ageNum) || ageNum < 16 || ageNum > 99) {
      Alert.alert(t(S.register.age) + " (16-99)");
      return;
    }
    if (!gender) {
      Alert.alert(t(S.register.gender));
      return;
    }
    if (password.length < 4) {
      Alert.alert(t(S.register.password) + " (min 4)");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        nickname,
        email,
        age: ageNum,
        gender,
        password,
      });
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(t(S.common.success), "რეგისტრაცია წარმატებით დასრულდა");
      router.replace("/rooms");
    } catch (e: unknown) {
      let message = t(S.common.error);
      if (e instanceof Error) {
        if (e.message === "email_in_use") {
          message = "ამ მეილზე უკვე არის ანგარიში";
        } else if (e.message === "invalid_input") {
          message = "მიუთითეთ სწორი ინფორმაცია";
        } else {
          message = e.message;
        }
      }
      Alert.alert(t(S.common.error), message);
    } finally {
      setSubmitting(false);
    }
  };

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
          <View style={styles.headerBlock}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={20} color="#0a0a0a" />
              <Text style={styles.backText}>{t(S.common.back)}</Text>
            </Pressable>
            <Text style={styles.title}>{t(S.register.title)}</Text>
          </View>

          <Field
            label={t(S.register.nickname)}
            icon="user"
            value={nickname}
            onChangeText={setNickname}
            placeholder={t(S.register.nickname)}
          />

          <Field
            label={t(S.register.email)}
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Field
            label={t(S.register.age)}
            icon="calendar"
            value={age}
            onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ""))}
            placeholder="24"
            keyboardType="number-pad"
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t(S.register.gender)}</Text>
            <View style={styles.genderRow}>
              <GenderTile
                active={gender === "male"}
                label={t(S.register.male)}
                icon="male"
                onPress={() => setGender("male")}
                activeColor={colors.brandPurple}
              />
              <GenderTile
                active={gender === "female"}
                label={t(S.register.female)}
                icon="female"
                onPress={() => setGender("female")}
                activeColor={colors.brandRed}
              />
            </View>
          </View>

          <Field
            label={t(S.register.password)}
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Pressable
            onPress={handleSubmit}
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
              <Text style={styles.primaryBtnText}>{t(S.register.save)}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            hitSlop={8}
            style={{ alignSelf: "center", marginTop: 12 }}
          >
            <Text
              style={{
                color: colors.brandRed,
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
              }}
            >
              {t(S.register.haveAccount)} {t(S.login.signIn)}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface FieldProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "number-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Feather name={icon} size={18} color="#0a0a0a" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9a9aa0"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize ?? "none"}
          style={styles.input}
        />
      </View>
    </View>
  );
}

interface GenderTileProps {
  active: boolean;
  label: string;
  icon: "male" | "female";
  onPress: () => void;
  activeColor: string;
}

function GenderTile({ active, label, icon, onPress, activeColor }: GenderTileProps) {
  const symbol = icon === "male" ? "♂" : "♀";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.genderTile,
        {
          borderColor: active ? activeColor : "#d8d8de",
          backgroundColor: active ? activeColor : "#fafafa",
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 28,
          color: active ? "#ffffff" : "#0a0a0a",
          fontFamily: "Inter_700Bold",
        }}
      >
        {symbol}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: active ? "#ffffff" : "#0a0a0a",
          fontFamily: "Inter_600SemiBold",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 16,
  },
  headerBlock: {
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  backText: {
    color: "#0a0a0a",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#0a0a0a",
  },
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
    borderColor: "#0a0a0a",
    borderRadius: 14,
    backgroundColor: "#fafafa",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#0a0a0a",
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderTile: {
    flex: 1,
    height: 96,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryBtn: {
    marginTop: 8,
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
});
