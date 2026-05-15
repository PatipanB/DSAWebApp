import { Slider } from '@/components/primitives/Slider';
import { usePrefsStore } from '@/store/prefsStore';
import { SPEED_PRESETS } from '@/constants/speeds';
import type { Runner } from '@/engine/runner';

interface Props {
  runner: Runner;
}

export function SpeedSlider({ runner }: Props) {
  const speedIndex = usePrefsStore((s) => s.speedIndex);
  const setSpeedIndex = usePrefsStore((s) => s.setSpeedIndex);

  const handleChange = (i: number) => {
    setSpeedIndex(i);
    const preset = SPEED_PRESETS[i];
    if (preset) runner.setSpeed(preset.ms);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-text-muted">Speed</span>
      <Slider min={0} max={4} value={speedIndex} onChange={handleChange} />
      <span className="text-xs font-mono text-accent-primary w-10">
        {SPEED_PRESETS[speedIndex]?.label ?? '1×'}
      </span>
    </div>
  );
}
