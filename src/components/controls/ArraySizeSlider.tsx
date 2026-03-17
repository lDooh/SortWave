import { EditableValue } from './EditableValue';

interface ArraySizeSliderProps {
  size: number;
  onChange: (size: number) => void;
  disabled: boolean;
}

export function ArraySizeSlider({ size, onChange, disabled }: ArraySizeSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600 font-medium whitespace-nowrap">배열 크기</label>
      <input
        type="range"
        min={5}
        max={50}
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-32 accent-blue-500 disabled:opacity-40"
      />
      <EditableValue value={size} min={5} max={50} onChange={onChange} width="w-6" />
    </div>
  );
}
