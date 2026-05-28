// src/components/primary-button.tsx

import { Pressable, StyleSheet, Text } from 'react-native';
import { palette, primary, radii, shadows, sizes, text } from '@/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cta,
        disabled && styles.ctaMuted,
        pressed && !disabled && styles.ctaPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.ctaLabel, disabled && styles.ctaLabelMuted]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cta: {
    height: sizes.buttonHeight,
    backgroundColor: primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryButton,
  },
  ctaMuted: {
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaPressed:    { opacity: 0.88 },
  ctaLabel:      { ...text.button, color: palette.primaryText },
  ctaLabelMuted: { color: palette.textDim },
});
