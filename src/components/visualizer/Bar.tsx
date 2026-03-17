import { memo } from 'react';
import type { BarState } from '../../types';

const BAR_COLORS: Record<BarState, string> = {
  default: 'bg-blue-500',
  comparing: 'bg-amber-400',
  swapping: 'bg-red-500',
  sorted: 'bg-green-500',
  pivot: 'bg-purple-500',
  current: 'bg-cyan-500',
};

interface BarProps {
  value: number;
  maxValue: number;
  state: BarState;
  showNumber: boolean;
  left: number;      // % 위치
  width: number;     // % 너비
  offsetY?: number;  // 수직 오프셋 (px)
}

export const Bar = memo(function Bar({
  value,
  maxValue,
  state,
  showNumber,
  left,
  width,
  offsetY,
}: BarProps) {
  const heightPercent = (value / maxValue) * 100;

  return (
    <div
      className="absolute bottom-0 px-[1px]"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        maxWidth: '75px',
        height: '100%',
        transition: 'left 300ms ease, transform 300ms ease',
        transform: `translateY(${offsetY ?? 0}px)`,
      }}
    >
      <div className="relative w-full h-full flex flex-col justify-end">
        {showNumber && (
          <span className="text-center text-xs text-gray-600 font-mono mb-0.5 truncate">
            {value}
          </span>
        )}
        <div
          className={`w-full rounded-t-sm ${BAR_COLORS[state]}`}
          style={{ height: `${heightPercent}%`, minHeight: '2px' }}
        />
      </div>
    </div>
  );
});
