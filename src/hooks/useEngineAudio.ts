/**
 * Procedural engine sound — sawtooth carrier whose frequency tracks RPM,
 * lowpass that opens as throttle rises, plus a sub-octave for rumble.
 * No audio files. Shares the Web Audio context with useMusic if both exist
 * (they each create their own context — simpler than a shared singleton).
 *
 * Usage:
 *   const { start, setRpm, setThrottle, stop, setMuted } = useEngineAudio();
 *   useEffect(() => { start(); return stop; }, []);
 *   on every frame: setRpm(0..1); setThrottle(0..1);
 */

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY_MUTED = 'lanechase-engine-muted';

interface Refs {
  ctx: AudioContext | null;
  master: GainNode | null;
  saw: OscillatorNode | null;
  sub: OscillatorNode | null;
  noise: AudioBufferSourceNode | null;
  filter: BiquadFilterNode | null;
  sawGain: GainNode | null;
  subGain: GainNode | null;
  noiseGain: GainNode | null;
}

const MIN_FREQ = 70;
const MAX_FREQ = 280;

export function useEngineAudio() {
  const refs = useRef<Refs>({
    ctx: null, master: null, saw: null, sub: null, noise: null,
    filter: null, sawGain: null, subGain: null, noiseGain: null,
  });
  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
  });
  const isStartedRef = useRef(false);

  const setMuted = (m: boolean) => {
    setIsMutedState(m);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_MUTED, String(m));
    const { master, ctx } = refs.current;
    if (master && ctx) {
      master.gain.linearRampToValueAtTime(m ? 0 : 0.5, ctx.currentTime + 0.1);
    }
  };

  const start = () => {
    if (isStartedRef.current) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === 'suspended') ctx.resume();

    const master = ctx.createGain();
    master.gain.value = isMuted ? 0 : 0.5;
    master.connect(ctx.destination);

    // Sub-octave (rumble)
    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.value = MIN_FREQ / 2;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.18;
    sub.connect(subGain).connect(master);
    sub.start();

    // Main sawtooth (engine note)
    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.value = MIN_FREQ;
    const sawGain = ctx.createGain();
    sawGain.gain.value = 0.30;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1.4;
    saw.connect(filter).connect(sawGain).connect(master);
    saw.start();

    // Wind/road noise (filtered noise)
    const len = Math.floor(ctx.sampleRate * 1.0);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start();

    refs.current = { ctx, master, saw, sub, noise, filter, sawGain, subGain, noiseGain };
    isStartedRef.current = true;
  };

  const stop = () => {
    const r = refs.current;
    try {
      r.saw?.stop();
      r.sub?.stop();
      r.noise?.stop();
      r.ctx?.close();
    } catch {
      /* ignore — already-stopped oscillators throw */
    }
    refs.current = {
      ctx: null, master: null, saw: null, sub: null, noise: null,
      filter: null, sawGain: null, subGain: null, noiseGain: null,
    };
    isStartedRef.current = false;
  };

  /** rpm 0..1 — controls engine pitch + filter cutoff + wind noise volume. */
  const setRpm = (rpm: number) => {
    const r = refs.current;
    if (!r.ctx || !r.saw || !r.sub || !r.filter || !r.noiseGain) return;
    const t = r.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, rpm));
    const freq = MIN_FREQ + (MAX_FREQ - MIN_FREQ) * clamped;
    r.saw.frequency.setTargetAtTime(freq, t, 0.04);
    r.sub.frequency.setTargetAtTime(freq / 2, t, 0.04);
    r.filter.frequency.setTargetAtTime(400 + clamped * 2400, t, 0.04);
    r.noiseGain.gain.setTargetAtTime(0.03 + clamped * 0.12, t, 0.08);
  };

  /** throttle 0..1 — controls the engine note's loudness. */
  const setThrottle = (throttle: number) => {
    const r = refs.current;
    if (!r.ctx || !r.sawGain) return;
    const t = r.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, throttle));
    r.sawGain.gain.setTargetAtTime(0.10 + clamped * 0.32, t, 0.05);
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return { start, stop, setRpm, setThrottle, isMuted, setMuted };
}
