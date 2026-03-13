interface StepDescriptionProps {
  description: string;
  currentStep: number;
  totalSteps: number;
}

export function StepDescription({ description, currentStep, totalSteps }: StepDescriptionProps) {
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
          현재 단계
        </span>
        <span className="text-xs text-gray-400 font-mono">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}
