import { create } from 'zustand';

interface PrefsState {
  speedIndex: number;
  setSpeedIndex: (i: number) => void;
  codeLanguage: 'ts' | 'py';
  setCodeLanguage: (l: 'ts' | 'py') => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const usePrefsStore = create<PrefsState>((set) => ({
  speedIndex: 2,
  setSpeedIndex: (i) => set({ speedIndex: clamp(i, 0, 4) }),
  codeLanguage: 'ts',
  setCodeLanguage: (l) => set({ codeLanguage: l }),
}));
