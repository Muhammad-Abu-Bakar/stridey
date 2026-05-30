// src/components/toast.tsx
//
// Top-anchored, auto-dismissing error toast. Each screen drives it with its
// own local state — no provider, no context.
//
// Usage:
//   const [toast, setToast] = useState<string | null>(null);
//   ...
//   <Toast message={toast} onHide={() => setToast(null)} />

import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { radii, spacing, text } from '@/theme';

const SLIDE_OFFSET = -10;

export function Toast({
  message,
  onHide,
  durationMs = 3500,
}: {
  message: string | null;
  onHide: () => void;
  durationMs?: number;
}) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SLIDE_OFFSET)).current;

  // Stays true from show until the fade-out animation completes, so the view
  // isn't unmounted mid-animation when message flips to null.
  const [rendered, setRendered] = useState(false);

  // Holds the last non-null message so the text doesn't blank during fade-out.
  const lastMessage = useRef('');

  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always call the latest onHide without making it a dep of dismiss.
  const onHideRef = useRef(onHide);
  useEffect(() => { onHideRef.current = onHide; });

  const dismiss = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: SLIDE_OFFSET, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      // `finished` is false if this animation was interrupted by a new one
      // (e.g. message changed while fading out). Skip teardown in that case.
      if (finished) {
        setRendered(false);
        onHideRef.current();
      }
    });
  }, [opacity, translateY]);

  useEffect(() => {
    if (message == null) return;

    lastMessage.current = message;
    setRendered(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Stop any in-progress animation before resetting, so setValue lands cleanly.
    opacity.stopAnimation();
    translateY.stopAnimation();
    opacity.setValue(0);
    translateY.setValue(SLIDE_OFFSET);

    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(dismiss, durationMs);

    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [message, durationMs, dismiss, opacity, translateY]);

  // Tidy up on unmount.
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (message == null && !rendered) return null;

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
    >
      <Pressable onPress={dismiss} style={styles.inner}>
        <Text style={styles.message}>{lastMessage.current}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 80, 80, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 80, 0.28)',
    zIndex: 999,
  },
  inner: {
    padding: spacing.sm,
  },
  message: {
    ...text.body,
    color: '#FF5050',
  },
});
