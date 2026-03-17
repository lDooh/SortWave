import { EditableValue } from './EditableValue';

interface SpeedSliderProps {
  speed: number;
  onChange: (speed: number) => void;
}

export function SpeedSlider({ speed, onChange }: SpeedSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600 font-medium whitespace-nowrap">속도</label>
      <input
        type="range"
        min={1}
        max={10}
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 accent-blue-500"
      />
      <EditableValue value={speed} min={1} max={10} onChange={onChange} width="w-6" />
    </div>
  );
}
