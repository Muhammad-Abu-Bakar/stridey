// src/app/(onboarding)/account-create.tsx — Screen 11

import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { TopChrome } from '@/components/top-chrome';
import { PrimaryButton } from '@/components/primary-button';
import { Toast } from '@/components/toast';
import { WeekStrip } from '@/components/week-strip';
import { supabase } from '@/lib/supabase';
import {
  useGoal,
  useWeeklyFrequency,
  useAvailableDays,
  type Goal,
  type WeeklyFrequency,
  type AvailableDays,
} from '@/lib/onboarding/store';
import { planName, planWeeks } from '@/lib/onboarding/plan-duration';
import { fonts, palette, primary, radii, sizes, spacing, text } from '@/theme';

// TODO: drop cast once permissions.tsx exists
const PERMISSIONS_ROUTE  = '/(onboarding)/permissions'  as Href;
const PLAN_SUMMARY_ROUTE = '/(onboarding)/plan-summary' as Href;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FALLBACK_DAYS: AvailableDays = [false, false, false, false, false, false, false];

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
    router.replace(PLAN_SUMMARY_ROUTE);
  }
}

export default function AccountCreateScreen() {
  const goal            = useGoal();
  const weeklyFrequency = useWeeklyFrequency();
  const availableDays   = useAvailableDays();

  const resolvedGoal:      Goal            = goal            ?? 'general-fitness';
  const resolvedFrequency: WeeklyFrequency = weeklyFrequency ?? 3;
  const resolvedDays:      AvailableDays   = availableDays   ?? FALLBACK_DAYS;

  const name  = planName(resolvedGoal);
  const weeks = planWeeks(resolvedGoal, resolvedFrequency);

  const [emailOpen,     setEmailOpen]     = useState(false);
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [loading,       setLoading]       = useState(false);
  const [authError,     setAuthError]     = useState<string | null>(null);
  const [emailError,    setEmailError]    = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [forgotSent,    setForgotSent]    = useState(false);

  function handleGoogle() {
    // TODO: Google OAuth, later step
  }

  async function handleEmailSignUp() {
    setAuthError(null);
    setEmailError(null);
    setPasswordError(null);
    setForgotSent(false);

    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    }
    if (!valid) return;

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      const isExisting =
        msg.includes('already registered') ||
        msg.includes('user already exists');
      if (!isExisting) {
        setLoading(false);
        setAuthError(signUpError.message);
        return;
      }
      // isExisting error → fall through to signIn below
    } else if (signUpData.session) {
      // Fresh account with an immediate session — done.
      setLoading(false);
      router.replace(PERMISSIONS_ROUTE);
      return;
    }

    // Reach here when: (a) an already-registered error was returned, or
    // (b) signUp succeeded but returned no session — Supabase's
    // enumeration-safe behaviour for an existing email address.
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setLoading(false);
      setAuthError(signInError.message);
      return;
    }
    if (!signInData.session) {
      setLoading(false);
      setAuthError('Could not sign in. Please try again.');
      return;
    }

    setLoading(false);
    router.replace(PERMISSIONS_ROUTE);
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setEmailError('Enter your email above first.');
      return;
    }
    await supabase.auth.resetPasswordForEmail(email.trim());
    setForgotSent(true);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Toast message={authError} onHide={() => setAuthError(null)} />

      <TopChrome step={11} onBack={handleBack} onClose={confirmQuit} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Plan chip */}
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {name} Plan · {weeks} weeks
            </Text>
            <WeekStrip
              days={resolvedDays}
              dotSize={10}
              gap={4}
              style={styles.chipStrip}
            />
          </View>

          <Text style={styles.headline}>Save your {name} Plan</Text>
          <Text style={styles.subhead}>
            Create an account so your plan syncs and won't get lost.
          </Text>

          {emailOpen && (
            <View style={styles.form}>
              <View style={styles.fieldWrap}>
                <TextInput
                  style={[styles.input, emailError != null && styles.inputError]}
                  placeholder="you@email.com"
                  placeholderTextColor={palette.textVeryDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setEmailError(null); }}
                />
                {emailError != null && (
                  <Text style={styles.fieldError}>{emailError}</Text>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <TextInput
                  style={[styles.input, passwordError != null && styles.inputError]}
                  placeholder="At least 8 characters"
                  placeholderTextColor={palette.textVeryDim}
                  secureTextEntry
                  autoComplete="password-new"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setPasswordError(null); }}
                />
                {passwordError != null && (
                  <Text style={styles.fieldError}>{passwordError}</Text>
                )}
                <Pressable onPress={handleForgotPassword} hitSlop={8} style={styles.forgotWrap}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
                {forgotSent && (
                  <Text style={styles.forgotSent}>Check your email for a reset link.</Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <Text style={styles.tcLine}>
              By continuing, you agree to our{' '}
              <Text
                style={styles.tcLink}
                onPress={() => { /* TODO real URLs before launch */ }}
              >
                Terms
              </Text>
              {' '}and{' '}
              <Text
                style={styles.tcLink}
                onPress={() => { /* TODO real URLs before launch */ }}
              >
                Privacy Policy
              </Text>
              .
            </Text>

            <Pressable
              onPress={handleGoogle}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
            >
              <AntDesign name="google" size={18} color={palette.secondaryText} />
              <Text style={styles.googleLabel}>Continue with Google</Text>
            </Pressable>

            {emailOpen && (
              loading ? (
                <View style={styles.loadingBtn}>
                  <ActivityIndicator color={palette.primaryText} />
                </View>
              ) : (
                <PrimaryButton
                  label="Continue with email"
                  onPress={handleEmailSignUp}
                />
              )
            )}

            <Pressable
              onPress={() => setEmailOpen((o) => !o)}
              hitSlop={8}
              style={styles.emailToggleWrap}
            >
              <Text style={styles.emailToggle}>
                {emailOpen ? 'Hide email form' : 'Use email instead'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  chipText: {
    ...text.caption,
    color: palette.textDim,
  },
  chipStrip: {
    marginLeft: spacing.xs,
  },
  headline: {
    ...text.h1,
    color: palette.text,
    marginBottom: spacing.xs,
  },
  subhead: {
    ...text.body,
    color: palette.textDim,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fieldWrap: {
    gap: spacing.xxs,
  },
  input: {
    height: sizes.buttonHeight,
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: palette.text,
  },
  inputError: {
    borderColor: '#FF5050',
  },
  fieldError: {
    ...text.caption,
    color: '#FF5050',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: spacing.xxs,
  },
  forgotText: {
    ...text.caption,
    color: palette.textDim,
  },
  forgotSent: {
    ...text.caption,
    color: primary,
    marginTop: spacing.xxs,
    textAlign: 'right',
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  footer: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  tcLine: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    color: palette.textVeryDim,
    textAlign: 'center',
  },
  tcLink: {
    color: palette.textDim,
    textDecorationLine: 'underline',
  },
  googleBtn: {
    height: sizes.buttonHeight,
    backgroundColor: palette.secondaryBg,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  googleBtnPressed: {
    opacity: 0.88,
  },
  googleLabel: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    letterSpacing: -0.08,
    color: palette.secondaryText,
  },
  loadingBtn: {
    height: sizes.buttonHeight,
    backgroundColor: primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailToggleWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  emailToggle: {
    ...text.body,
    color: palette.textDim,
  },
});
