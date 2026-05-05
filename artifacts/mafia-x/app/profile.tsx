import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

const TARGET_SIZE = 800;

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, setAvatar } = useAuth();
  const { t, S } = useLanguage();
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (!user) router.replace("/");
  }, [user]);

  const handlePick = useCallback(async () => {
    setBusy(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t(S.common.error), t(S.profile.permissionDenied));
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0]!;

      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: TARGET_SIZE, height: TARGET_SIZE } }],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );

      const dataUri = manipulated.base64
        ? `data:image/jpeg;base64,${manipulated.base64}`
        : manipulated.uri;
      await setAvatar(dataUri);
      Alert.alert(t(S.common.success), t(S.profile.saved));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      Alert.alert(t(S.common.error), msg);
    } finally {
      setBusy(false);
    }
  }, [setAvatar, t, S]);

  const handleRemove = useCallback(async () => {
    setBusy(true);
    try {
      await setAvatar(null);
      Alert.alert(t(S.common.success), t(S.profile.removed));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t(S.common.error);
      Alert.alert(t(S.common.error), msg);
    } finally {
      setBusy(false);
    }
  }, [setAvatar, t, S]);

  if (!user) return null;
  const initial = (user.nickname.charAt(0) ?? "U").toUpperCase();
  const topPad = Math.max(insets.top, 16);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              borderColor: colors.brandPurple,
              backgroundColor: colors.panelSurface,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          {t(S.profile.photoTitle)}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={handlePick}
          disabled={busy}
          style={({ pressed }) => [
            styles.photoFrame,
            {
              borderColor: colors.brandRed,
              backgroundColor: colors.panelSurface,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {user.avatarUri ? (
            <Image
              source={{ uri: user.avatarUri }}
              style={styles.photo}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <View
                style={[
                  styles.initialCircle,
                  { backgroundColor: colors.brandPurple },
                ]}
              >
                <Text style={styles.initialText}>{initial}</Text>
              </View>
              <Feather name="camera" size={32} color={colors.brandOrange} />
              <Text
                style={[
                  styles.placeholderHint,
                  { color: colors.mutedForeground },
                ]}
              >
                {t(S.profile.uploadHint)}
              </Text>
            </View>
          )}
          {busy ? (
            <View style={styles.busyOverlay}>
              <ActivityIndicator color="#fff" size="large" />
            </View>
          ) : null}
        </Pressable>

        <View
          style={[
            styles.specCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.brandPurple,
            },
          ]}
        >
          <Feather name="info" size={14} color={colors.brandOrange} />
          <Text style={[styles.specText, { color: colors.text }]}>
            {t(S.profile.uploadHint)}
          </Text>
        </View>

        <Pressable
          onPress={handlePick}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.brandRed,
              opacity: pressed || busy ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="image" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>
            {t(S.profile.pickFromGallery)}
          </Text>
        </Pressable>

        {user.avatarUri ? (
          <Pressable
            onPress={handleRemove}
            disabled={busy}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: colors.brandPurple,
                opacity: pressed || busy ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="trash-2" size={16} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
              {t(S.profile.remove)}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  photoFrame: {
    aspectRatio: 1,
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
  },
  initialCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 38,
  },
  placeholderHint: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "center",
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  specCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  specText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
