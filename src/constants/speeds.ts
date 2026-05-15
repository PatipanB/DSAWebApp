export const SPEED_PRESETS = [
  { label: '0.25×', ms: 2000 },
  { label: '0.5×',  ms: 1000 },
  { label: '1×',    ms: 500  },
  { label: '2×',    ms: 250  },
  { label: '4×',    ms: 100  },
] as const;

export type SpeedPreset = (typeof SPEED_PRESETS)[number];
