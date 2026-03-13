import { useMemo } from 'react';
import type { AlgorithmInfo } from '../../types';
import { useAnimator } from '../../hooks/useAnimator';
import { BarChart } from './BarChart';
import { CodePanel } from '../code/CodePanel';
import { StepDescription } from '../code/StepDescription';
import { ControlPanel } from '../controls/ControlPanel';
import { SpeedSlider } from '../controls/SpeedSlider';
import { ArraySizeSlider } from '../controls/ArraySizeSlider';

interface VisualizerPanelProps {
  algorithm: AlgorithmInfo;
  ids: number[];
  values: number[];
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  onRegenerate: () => void;
}

export function VisualizerPanel({
  algorithm,
  ids,
  values,
  arraySize,
  onArraySizeChange,
  onRegenerate,
}: VisualizerPanelProps) {
  const steps = useMemo(() => algorithm.generateSteps(ids, values), [algorithm, ids, values]);

  const {
    currentStep,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    totalSteps,
  } = useAnimator(steps);

  const step = steps[currentStep];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* 시각화 영역 */}
      <div className="flex-1 min-h-0 p-4">
        <div className="bg-white rounded-xl border border-gray-200 h-full shadow-sm">
          <BarChart step={step} />
        </div>
      </div>

      {/* 하단: 코드 + 설명 + 컨트롤 */}
      <div className="border-t border-gray-200 bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CodePanel codeLines={algorithm.codeLines} currentLine={step.codeLine} />
          <StepDescription
            description={step.description}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <ControlPanel
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onReset={reset}
            onRegenerate={onRegenerate}
            canStepForward={currentStep < totalSteps - 1}
            canStepBackward={currentStep > 0}
          />
          <div className="flex items-center gap-6">
            <SpeedSlider speed={speed} onChange={setSpeed} />
            <ArraySizeSlider size={arraySize} onChange={onArraySizeChange} disabled={isPlaying} />
          </div>
        </div>
      </div>
    </div>
  );
}
