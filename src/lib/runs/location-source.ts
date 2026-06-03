import * as Location from 'expo-location';

export type LocationSample = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number | null;
};

export type LocationSource = {
  start: (onSample: (sample: LocationSample) => void) => Promise<void>;
  stop: () => Promise<void>;
};

export function createForegroundLocationSource(): LocationSource {
  let subscription: Location.LocationSubscription | null = null;

  return {
    async start(onSample) {
      if (subscription) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (loc) =>
          onSample({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: loc.timestamp,
            accuracy: loc.coords.accuracy ?? null,
          }),
      );
    },

    async stop() {
      if (!subscription) return;
      subscription.remove();
      subscription = null;
    },
  };
}
