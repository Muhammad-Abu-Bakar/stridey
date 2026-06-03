import { useState, useRef, useEffect, useCallback } from 'react';
import { createForegroundLocationSource, type LocationSample, type LocationSource } from './location-source';
import { haversineMeters, avgPaceSecPerKm } from './geo';

const ACCURACY_THRESHOLD_M = 30;
const MIN_SEGMENT_M = 1;

export type RunState = 'idle' | 'running' | 'paused' | 'finished';

export type RunSummary = {
  startedAt: number;
  endedAt: number;
  distanceM: number;
  durationS: number;
  avgPaceSecPerKm: number | null;
  points: LocationSample[];
};

export function useRunRecorder() {
  const [state, setState] = useState<RunState>('idle');
  const [distanceM, setDistanceM] = useState(0);
  const [durationS, setDurationS] = useState(0);

  const sourceRef = useRef<LocationSource | null>(null);
  const lastSampleRef = useRef<LocationSample | null>(null);
  const pointsRef = useRef<LocationSample[]>([]);
  const distanceMRef = useRef(0);
  const accumulatedActiveMsRef = useRef(0);
  const segmentStartMsRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const acceptingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function computeActiveMs(): number {
    const base = accumulatedActiveMsRef.current;
    return segmentStartMsRef.current != null
      ? base + (Date.now() - segmentStartMsRef.current)
      : base;
  }

  function startInterval() {
    if (intervalRef.current != null) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDistanceM(distanceMRef.current);
      setDurationS(Math.floor(computeActiveMs() / 1000));
    }, 1000);
  }

  function stopInterval() {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const onSample = useCallback((sample: LocationSample) => {
    if (sample.accuracy != null && sample.accuracy > ACCURACY_THRESHOLD_M) return;
    if (!acceptingRef.current) return;
    pointsRef.current.push(sample);
    const last = lastSampleRef.current;
    if (last) {
      const seg = haversineMeters(last, sample);
      if (seg >= MIN_SEGMENT_M) distanceMRef.current += seg;
    }
    lastSampleRef.current = sample;
  }, []);

  const start = useCallback(async () => {
    if (state !== 'idle') return;
    lastSampleRef.current = null;
    pointsRef.current = [];
    distanceMRef.current = 0;
    accumulatedActiveMsRef.current = 0;
    const now = Date.now();
    segmentStartMsRef.current = now;
    startedAtRef.current = now;
    acceptingRef.current = true;
    setDistanceM(0);
    setDurationS(0);
    sourceRef.current = createForegroundLocationSource();
    await sourceRef.current.start(onSample);
    setState('running');
    startInterval();
  }, [state, onSample]);

  const pause = useCallback(() => {
    if (state !== 'running') return;
    accumulatedActiveMsRef.current += Date.now() - (segmentStartMsRef.current ?? Date.now());
    segmentStartMsRef.current = null;
    acceptingRef.current = false;
    stopInterval();
    setState('paused');
  }, [state]);

  const resume = useCallback(() => {
    if (state !== 'paused') return;
    segmentStartMsRef.current = Date.now();
    lastSampleRef.current = null;
    acceptingRef.current = true;
    startInterval();
    setState('running');
  }, [state]);

  const stop = useCallback(async (): Promise<RunSummary> => {
    if (state !== 'running' && state !== 'paused') throw new Error('not recording');
    const endedAt = Date.now();
    if (state === 'running') {
      accumulatedActiveMsRef.current += endedAt - (segmentStartMsRef.current ?? endedAt);
    }
    segmentStartMsRef.current = null;
    acceptingRef.current = false;
    const durationS = Math.floor(accumulatedActiveMsRef.current / 1000);
    const distanceM = distanceMRef.current;
    await sourceRef.current?.stop();
    sourceRef.current = null;
    stopInterval();
    setState('finished');
    setDistanceM(distanceM);
    setDurationS(durationS);
    return {
      startedAt: startedAtRef.current ?? endedAt,
      endedAt,
      distanceM,
      durationS,
      avgPaceSecPerKm: avgPaceSecPerKm(distanceM, durationS),
      points: pointsRef.current,
    };
  }, [state]);

  useEffect(() => {
    return () => {
      stopInterval();
      sourceRef.current?.stop();
    };
  }, []);

  return {
    state,
    distanceM,
    durationS,
    paceSecPerKm: avgPaceSecPerKm(distanceM, durationS),
    start,
    pause,
    resume,
    stop,
  };
}
