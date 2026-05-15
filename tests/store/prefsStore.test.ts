import { describe, it, expect, beforeEach } from 'vitest';
import { usePrefsStore } from '@/store/prefsStore';

describe('prefsStore', () => {
  beforeEach(() => usePrefsStore.setState({ speedIndex: 2 }));

  it('defaults speedIndex to 2 (1× preset)', () => {
    expect(usePrefsStore.getState().speedIndex).toBe(2);
  });

  it('updates speedIndex within bounds', () => {
    usePrefsStore.getState().setSpeedIndex(4);
    expect(usePrefsStore.getState().speedIndex).toBe(4);
  });

  it('clamps speedIndex to [0,4]', () => {
    usePrefsStore.getState().setSpeedIndex(99);
    expect(usePrefsStore.getState().speedIndex).toBe(4);
    usePrefsStore.getState().setSpeedIndex(-3);
    expect(usePrefsStore.getState().speedIndex).toBe(0);
  });
});
