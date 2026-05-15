import { describe, it, expect, beforeEach } from 'vitest';
import { useTopicStore } from '@/store/topicStore';

describe('topicStore', () => {
  beforeEach(() => useTopicStore.setState({ selectedTopicId: null }));

  it('defaults selectedTopicId to null', () => {
    expect(useTopicStore.getState().selectedTopicId).toBeNull();
  });

  it('sets the selected topic id', () => {
    useTopicStore.getState().setSelectedTopicId('arrays');
    expect(useTopicStore.getState().selectedTopicId).toBe('arrays');
  });

  it('clears the selection when given null', () => {
    useTopicStore.getState().setSelectedTopicId('graph');
    useTopicStore.getState().setSelectedTopicId(null);
    expect(useTopicStore.getState().selectedTopicId).toBeNull();
  });
});
