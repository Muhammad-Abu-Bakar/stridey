import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { ONBOARDING_COMPLETE_KEY } from '@/lib/onboarding/finalize-onboarding';
import { useProfile } from '@/lib/profile/use-profile';
import { supabase } from '@/lib/supabase';
import { MONTHS } from '@/lib/dates';
import { fonts, palette, primary, radii, spacing, text } from '@/theme';

export default function ProfileScreen() {
  const state = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (state.kind === 'loading') {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color={primary} style={styles.centered} />
      </SafeAreaView>
    );
  }

  if (state.kind === 'error') {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={[styles.centered, text.body, { color: palette.text }]}>
          Couldn't load your profile.
        </Text>
      </SafeAreaView>
    );
  }

  const { email, name, units, createdAt } = state;

  const openEditor = () => {
    setDraft(name ?? '');
    setEditing(true);
  };

  const save = async () => {
    await state.updateName(draft);
    setEditing(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    router.replace('/(onboarding)/welcome');
  };

  const d = new Date(createdAt);
  const memberSince = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const avatarLetter = (name ?? email).charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Profile</Text>

        {/* Identity */}
        <Pressable style={styles.identityRow} onPress={openEditor}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={name ? styles.nameSet : styles.namePlaceholder}>
              {name ?? 'Add your name'}
            </Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.memberSince}>Member since {memberSince}</Text>
          </View>
        </Pressable>

        {/* Settings */}
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={openEditor}>
            <Text style={styles.rowLabel}>Name</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{name ?? 'Add'}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Units</Text>
            <View style={styles.segmented}>
              {(['km', 'mi'] as const).map(u => (
                <Pressable
                  key={u}
                  style={[styles.segment, units === u && styles.segmentSelected]}
                  onPress={() => state.updateUnits(u)}
                >
                  <Text style={[styles.segmentText, units === u && styles.segmentTextSelected]}>
                    {u}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Running stats */}
        <Text style={styles.sectionLabel}>RUNNING STATS</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No runs recorded yet</Text>
          <Text style={styles.emptyBody}>
            Your distance and progress will show here once you log runs.
          </Text>
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]}
          onPress={() =>
            Alert.alert('Sign out?', "You'll go back to setup.", [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: handleSignOut },
            ])
          }
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

      </ScrollView>

      {/* Name-editor modal */}
      <Modal
        transparent
        animationType="fade"
        visible={editing}
        onRequestClose={() => setEditing(false)}
      >
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalLabel}>Your name</Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              autoFocus
              placeholder="Enter your name"
              placeholderTextColor={palette.textDim}
              style={styles.input}
              maxLength={40}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={save}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={save}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  centered: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
  scroll: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...text.h1,
    color: palette.text,
  },
  // Identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,126,92,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: primary,
    fontFamily: fonts.displaySemiBold,
    fontSize: 22,
  },
  nameSet: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: palette.text,
  },
  namePlaceholder: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: palette.textDim,
  },
  email: {
    ...text.caption,
    color: palette.textDim,
    marginTop: 2,
  },
  memberSince: {
    ...text.caption,
    color: palette.textVeryDim,
    marginTop: 2,
  },
  // Section labels
  sectionLabel: {
    ...text.caption,
    color: palette.textVeryDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  // Settings card
  card: {
    backgroundColor: palette.cardBg,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    ...text.body,
    color: palette.text,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    ...text.body,
    color: palette.textDim,
  },
  chevron: {
    color: palette.textVeryDim,
    marginLeft: spacing.xs,
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.xs,
  },
  // Units segmented control
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.pill,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  segmentSelected: {
    backgroundColor: primary,
    borderRadius: radii.pill,
  },
  segmentText: {
    ...text.body,
    color: palette.textDim,
  },
  segmentTextSelected: {
    color: palette.primaryText,
    fontFamily: fonts.bodySemiBold,
  },
  // Running stats empty card
  emptyCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    ...text.body,
    color: palette.text,
  },
  emptyBody: {
    ...text.caption,
    color: palette.textDim,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  // Sign out
  signOut: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: primary,
    borderRadius: radii.pill,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: fonts.displaySemiBold,
    color: primary,
  },
  // Name-editor modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: palette.secondaryBg,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  modalLabel: {
    ...text.caption,
    color: palette.textDim,
    marginBottom: spacing.xs,
  },
  input: {
    color: palette.text,
    fontFamily: fonts.body,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelText: {
    ...text.body,
    color: palette.textDim,
    lineHeight: 40,
  },
  saveButton: {
    backgroundColor: primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontFamily: fonts.bodySemiBold,
    color: palette.primaryText,
  },
});
