import { useMemo } from 'react';
import type { AnimationStep } from '../../types';
import { Bar } from './Bar';

interface BarChartProps {
  step: AnimationStep;
}

export function BarChart({ step }: BarChartProps) {
  const maxValue = Math.max(...step.bars.map((b) => b.value));
  const barCount = step.bars.length;
  const barWidth = 100 / barCount;
  const showNumber = barCount <= 30;

  // id → 현재 배열 인덱스 매핑
  const positionMap = useMemo(() => {
    const map = new Map<number, number>();
    step.bars.forEach((bar, index) => map.set(bar.id, index));
    return map;
  }, [step.bars]);

  // id 순으로 정렬하여 DOM 순서를 항상 고정 (CSS transition이 정상 동작)
  const sortedBars = useMemo(
    () => [...step.bars].sort((a, b) => a.id - b.id),
    [step.bars],
  );

  return (
    <div className="relative h-full px-2 pt-6 pb-2">
      {sortedBars.map((bar) => (
        <Bar
          key={bar.id}
          value={bar.value}
          maxValue={maxValue}
          state={bar.state}
          showNumber={showNumber}
          left={(positionMap.get(bar.id) ?? 0) * barWidth}
          width={barWidth}
          offsetY={bar.offsetY}
        />
      ))}
    </div>
  );
}
