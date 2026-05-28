import { ReactNode } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { palette, primary, text, spacing, radii, sizes } from '@/theme';

export type OnboardingCardProps = {
  title: string;
  description?: string;
  descriptionLines?: number;   // defaults to 1; pass 2 where desc may wrap
  tag?: string;                // uppercase pill rendered in-flow above title
  footer?: ReactNode;          // in-flow after description; hosts WeekStrip
  leading?: ReactNode;
  selected: boolean;
  onPress: () => void;
  variant?: 'standard' | 'tall';
  disabled?: boolean;
  testID?: string;
};

const CHECK_SIZE = 20;
const BORDER_WIDTH = 2;

export function OnboardingCard({
  title,
  description,
  descriptionLines = 1,
  tag,
  footer,
  leading,
  selected,
  onPress,
  variant = 'standard',
  disabled = false,
  testID,
}: OnboardingCardProps) {
  const height = variant === 'tall' ? sizes.cardTall : sizes.cardStandard;
  const hasExtras = !!tag || !!footer;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.card,
        hasExtras ? { minHeight: height } : { height },
        hasExtras && styles.cardExtrasLayout,
        selected ? styles.cardSelected : styles.cardUnselected,
        pressed && !disabled && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}
    >
      {tag ? (
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.description} numberOfLines={descriptionLines}>
          {description}
        </Text>
      ) : null}
      {footer ? <View style={styles.footerWrapper}>{footer}</View> : null}
      {selected ? (
        <View style={styles.check} accessible={false}>
          <Text style={styles.checkGlyph}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: BORDER_WIDTH,
    backgroundColor: palette.cardBg,
    position: 'relative',
  },
  cardExtrasLayout: {
    justifyContent: 'flex-start',
  },
  cardUnselected: {
    borderColor: palette.border,
  },
  cardSelected: {
    borderColor: primary,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: `${primary}22`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginBottom: spacing.xxs,
  },
  tagText: {
    ...text.caption,
    color: primary,
    textTransform: 'uppercase',
  },
  leading: {
    marginBottom: spacing.xxs,
  },
  title: {
    ...text.button,
    color: palette.text,
  },
  description: {
    fontFamily: text.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.textDim,
    marginTop: 2,
  },
  footerWrapper: {
    marginTop: spacing.xxs,
  },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    color: palette.primaryText,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
});
