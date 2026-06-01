import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';

type State = {
  granted: boolean;
  canAskAgain: boolean;
};

async function queryPermission(): Promise<State> {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
  return { granted: status === 'granted', canAskAgain };
}

export function useLocationPermission(): { granted: boolean; fix: () => Promise<void> } {
  const [state, setState] = useState<State>({ granted: true, canAskAgain: true });

  useEffect(() => {
    queryPermission().then(setState);

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') queryPermission().then(setState);
    });

    return () => sub.remove();
  }, []);

  async function fix() {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted' && !canAskAgain) {
      Linking.openSettings();
    }
    queryPermission().then(setState);
  }

  return { granted: state.granted, fix };
}
