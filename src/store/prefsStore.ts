import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TopicId } from '@/types/topic';

interface PrefsState {
  speedIndex: number;
  setSpeedIndex: (i: number) => void;
  codeLanguage: 'ts' | 'py';
  setCodeLanguage: (l: 'ts' | 'py') => void;
  visitedTopics: TopicId[];
  markVisited: (id: TopicId) => void;
  learningMode: boolean;
  setLearningMode: (v: boolean) => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      speedIndex: 2,
      setSpeedIndex: (i) => set({ speedIndex: clamp(i, 0, 4) }),
      codeLanguage: 'ts',
      setCodeLanguage: (l) => set({ codeLanguage: l }),
      visitedTopics: [],
      markVisited: (id) =>
        set((s) =>
          s.visitedTopics.includes(id) ? s : { visitedTopics: [...s.visitedTopics, id] }
        ),
      learningMode: false,
      setLearningMode: (v) => set({ learningMode: v }),
    }),
    { name: 'dsa-prefs' },
  ),
);
