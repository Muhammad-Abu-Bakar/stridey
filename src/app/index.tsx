import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ONBOARDING_COMPLETE_KEY } from '@/lib/onboarding/finalize-onboarding';
import { palette, primary } from '@/theme';

export default function Index() {
  const [complete, setComplete] = useState<boolean | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
      .then((value) => { if (mounted.current) setComplete(value === 'true'); })
      .catch(() => { if (mounted.current) setComplete(false); });
    return () => { mounted.current = false; };
  }, []);

  if (complete === null) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={primary} />
      </View>
    );
  }

  return <Redirect href={complete ? ('/home' as Href) : '/(onboarding)/welcome'} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
