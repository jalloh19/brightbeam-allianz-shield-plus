import { SelectHTMLAttributes, forwardRef } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  isValid?: boolean;
  options: { value: string; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, isValid, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-[#002B7F]" style={{ fontWeight: 600 }}>
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={`w-full h-12 px-4 pr-10 bg-white border ${
              error ? 'border-[#F04438]' : 'border-[#E4E7EC]'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent transition-all appearance-none ${className}`}
            {...props}
          >
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-6 h-6 text-[#475467] pointer-events-none" />
          {isValid && !error && props.value && (
            <CheckCircle2 className="absolute right-10 top-3 w-6 h-6 text-[#12B76A]" />
          )}
        </div>
        {error && (
          <p className="text-[#F04438] text-sm">{error}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
