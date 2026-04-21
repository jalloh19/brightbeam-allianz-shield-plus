import { InputHTMLAttributes, forwardRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isValid?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, isValid, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-[#002B7F]" style={{ fontWeight: 600 }}>
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className={`w-full h-12 px-4 bg-white border ${
              error ? 'border-[#F04438]' : 'border-[#E4E7EC]'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent transition-all ${className}`}
            {...props}
          />
          {isValid && !error && props.value && (
            <CheckCircle2 className="absolute right-3 top-3 w-6 h-6 text-[#12B76A]" />
          )}
        </div>
        {error && (
          <p className="text-[#F04438] text-sm">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
