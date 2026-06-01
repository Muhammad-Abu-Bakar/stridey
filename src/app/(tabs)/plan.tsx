import { View, Text } from 'react-native';

import { palette, text } from '@/theme';

export default function PlanScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[text.h1, { color: palette.text }]}>Plan</Text>
    </View>
  );
}
