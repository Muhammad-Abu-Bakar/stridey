import { Pressable, StyleSheet, Text } from 'react-native';

import { PathGlyph } from '@/components/path-glyph';
import { fonts, palette, primary, radii, spacing, text } from '@/theme';

type Props = { onPress: () => void };

export function LocationBanner({ onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
      onPress={onPress}>
      <PathGlyph name="pin-trail" size={22} color={primary} />
      <Text style={styles.message}>Enable location to record runs</Text>
      <Text style={styles.cta}>Enable</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.cardBg,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
  },
  message: {
    ...text.body,
    color: palette.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  cta: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    color: primary,
  },
});
