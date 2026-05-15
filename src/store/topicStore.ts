import { create } from 'zustand';
import type { TopicId } from '@/types/topic';

interface TopicState {
  selectedTopicId: TopicId | null;
  setSelectedTopicId: (id: TopicId | null) => void;
}

export const useTopicStore = create<TopicState>((set) => ({
  selectedTopicId: null,
  setSelectedTopicId: (id) => set({ selectedTopicId: id }),
}));
