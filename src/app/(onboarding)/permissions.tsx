// src/app/(onboarding)/permissions.tsx — Screen 12

import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { TopChrome } from '@/components/top-chrome';
import { PathGlyph } from '@/components/path-glyph';
import { Toast } from '@/components/toast';
import {
  useOnboardingStore,
  type SupabaseOnboardingPayload,
} from '@/lib/onboarding/store';
import { finalizeOnboarding } from '@/lib/onboarding/finalize-onboarding';
import { fonts, palette, primary, radii, sizes, spacing, text } from '@/theme';

// ─── Types ────────────────────────────────────────────────────────────

type PermStatus = 'not-asked' | 'granted' | 'denied';

// ─── Route constants ──────────────────────────────────────────────────

const ACCOUNT_CREATE_ROUTE = '/(onboarding)/account-create' as Href;

// ─── Module-level handlers (no screen state captured) ─────────────────

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/home') },
  ]);
}

function handleBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(ACCOUNT_CREATE_ROUTE);
  }
}

// ─── Screen ───────────────────────────────────────────────────────────

export default function PermissionsScreen() {
  const [locationStatus,     setLocationStatus]     = useState<PermStatus>('not-asked');
  const [notificationStatus, setNotificationStatus] = useState<PermStatus>('not-asked');
  const [writing,            setWriting]            = useState(false);
  const [writeError,         setWriteError]         = useState<string | null>(null);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationStatus(status === 'granted' ? 'granted' : 'denied');
  }

  async function requestNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationStatus(status === 'granted' ? 'granted' : 'denied');
  }

  async function handleContinue() {
    if (writing) return;
    setWriteError(null);
    setWriting(true);

    const s = useOnboardingStore.getState();
    const payload: SupabaseOnboardingPayload = {
      goal:            s.goal,
      startingPoint:   s.startingPoint,
      weeklyFrequency: s.weeklyFrequency,
      availableDays:   s.availableDays,
      startDate:       s.startDate,
      units:           s.units,
      templateId:      s.templateId,
    };

    try {
      await finalizeOnboarding(payload);
      router.replace('/home');
    } catch (e) {
      setWriting(false);
      setWriteError(
        e instanceof Error ? e.message : 'Could not save your plan. Please try again.',
      );
    }
  }

  const bothResponded    = locationStatus !== 'not-asked' && notificationStatus !== 'not-asked';
  const continueLabel    = locationStatus === 'granted' ? 'Continue' : 'Continue anyway';
  const continueDisabled = !bothResponded || writing;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Toast message={writeError} onHide={() => setWriteError(null)} />

      <TopChrome step={12} onBack={handleBack} onClose={confirmQuit} />

      <View style={styles.body}>
        <Text style={styles.headline}>Two last things</Text>
        <Text style={styles.subhead}>
          We'll ask Android for permission. You can change these anytime in Settings.
        </Text>

        <View style={styles.cards}>

          {/* ── Location ───────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <PathGlyph
                name="pin-trail"
                size={28}
                color={locationStatus === 'granted' ? primary : palette.textDim}
              />
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>Location</Text>
                  <View style={styles.requiredPill}>
                    <Text style={styles.requiredPillText}>Required</Text>
                  </View>
                </View>
                <Text style={styles.cardBody}>Track your runs and map your route.</Text>
                <View style={styles.cardBtnRow}>
                  {locationStatus === 'granted' ? (
                    <View style={styles.grantedBadge}>
                      <Text style={styles.grantedText}>Granted ✓</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={requestLocation}
                      accessibilityRole="button"
                      accessibilityLabel="Allow location"
                      style={({ pressed }) => [
                        styles.allowBtn,
                        pressed && styles.allowBtnPressed,
                      ]}
                    >
                      <Text style={styles.allowBtnText}>Allow location</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* ── Notifications ──────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <PathGlyph
                name="pulse-rings"
                size={28}
                color={notificationStatus === 'granted' ? primary : palette.textDim}
              />
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>Notifications</Text>
                </View>
                <Text style={styles.cardBody}>
                  A daily reminder about today's session. No spam.
                </Text>
                <View style={styles.cardBtnRow}>
                  {notificationStatus === 'granted' ? (
                    <View style={styles.grantedBadge}>
                      <Text style={styles.grantedText}>Granted ✓</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={requestNotifications}
                      accessibilityRole="button"
                      accessibilityLabel="Allow notifications"
                      style={({ pressed }) => [
                        styles.allowBtn,
                        pressed && styles.allowBtnPressed,
                      ]}
                    >
                      <Text style={styles.allowBtnText}>Allow notifications</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </View>

        </View>

        <View style={styles.spacer} />
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          disabled={continueDisabled}
          accessibilityRole="button"
          accessibilityLabel={continueLabel}
          style={({ pressed }) => [
            styles.continueBtn,
            continueDisabled
              ? styles.continueBtnMuted
              : pressed && styles.continueBtnPressed,
          ]}
        >
          {writing ? (
            <ActivityIndicator color={palette.primaryText} />
          ) : (
            <Text
              style={[
                styles.continueBtnLabel,
                continueDisabled && styles.continueBtnLabelMuted,
              ]}
            >
              {continueLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  headline: {
    ...text.h1,
    color: palette.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subhead: {
    ...text.body,
    color: palette.textDim,
    marginBottom: spacing.xl,
  },
  cards: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: palette.text,
  },
  requiredPill: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  requiredPillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    lineHeight: 14,
    color: palette.textVeryDim,
    letterSpacing: 0.2,
  },
  cardBody: {
    ...text.caption,
    color: palette.textDim,
  },
  cardBtnRow: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  allowBtn: {
    borderWidth: 1,
    borderColor: primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  allowBtnPressed: {
    opacity: 0.7,
  },
  allowBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: primary,
  },
  grantedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  grantedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: primary,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  continueBtn: {
    height: sizes.buttonHeight,
    backgroundColor: primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnMuted: {
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  continueBtnPressed: {
    opacity: 0.88,
  },
  continueBtnLabel: {
    ...text.button,
    color: palette.primaryText,
  },
  continueBtnLabelMuted: {
    color: palette.textDim,
  },
});
