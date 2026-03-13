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
        max={100}
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-32 accent-blue-500 disabled:opacity-40"
      />
      <span className="text-xs text-gray-400 font-mono w-6">{size}</span>
    </div>
  );
}
