import { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  showBack?: boolean;
}

export function StepContainer({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  isNextDisabled = false,
  showBack = true,
}: StepContainerProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h2 className="text-3xl text-[#002B7F] mb-2" style={{ fontWeight: 700 }}>
          {title}
        </h2>
        {description && (
          <p className="text-[#475467] text-lg">{description}</p>
        )}
      </div>

      <div className="space-y-6">
        {children}
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E4E7EC]">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-[#475467] hover:text-[#003DA5] transition-colors rounded-xl hover:bg-[#EAF2FF]"
            style={{ fontWeight: 600 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        ) : (
          <div />
        )}

        {onNext && (
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="flex items-center gap-2 px-8 py-3 bg-[#003DA5] hover:bg-[#002B7F] text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#003DA5]"
            style={{ fontWeight: 600 }}
          >
            {nextLabel}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
