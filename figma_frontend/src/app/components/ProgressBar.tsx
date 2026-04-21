interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="sticky top-0 bg-white border-b border-[#E4E7EC] py-6 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#475467]">Step {currentStep} of {totalSteps}</span>
          <span className="text-[#003DA5]" style={{ fontWeight: 600 }}>{Math.round(progress)}%</span>
        </div>
        <div className="relative h-2 bg-[#EAF2FF] rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#003DA5] to-[#002B7F] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
