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

  return (
    <div className="relative h-full px-2 pt-6 pb-2">
      {step.bars.map((bar, index) => (
        <Bar
          key={bar.id}
          value={bar.value}
          maxValue={maxValue}
          state={bar.state}
          showNumber={showNumber}
          left={index * barWidth}
          width={barWidth}
          offsetY={bar.offsetY}
        />
      ))}
    </div>
  );
}
