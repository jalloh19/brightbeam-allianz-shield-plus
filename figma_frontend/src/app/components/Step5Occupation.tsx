import { GraduationCap, Info } from 'lucide-react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';

interface Step5Props {
  formData: {
    occupation: string;
    industry: string;
    employerName: string;
    workEnvironment: string;
  };
  onChange: (field: string, value: string) => void;
}

const industries = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality & Tourism' },
  { value: 'construction', label: 'Construction' },
  { value: 'student', label: 'Student' },
  { value: 'other', label: 'Other' },
];

const workEnvironments = [
  { value: 'office', label: 'Office-based' },
  { value: 'outdoor', label: 'Outdoor/Field Work' },
  { value: 'construction', label: 'Construction Site' },
  { value: 'driving', label: 'Driving/Transportation' },
  { value: 'student', label: 'Student' },
  { value: 'other', label: 'Other' },
];

export function Step5Occupation({ formData, onChange }: Step5Props) {
  const isStudent = formData.workEnvironment === 'student' || formData.industry === 'student';

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <FormInput
          label="Occupation"
          placeholder="e.g., Software Engineer, Teacher, Student"
          value={formData.occupation}
          onChange={(e) => onChange('occupation', e.target.value)}
          isValid={formData.occupation.length > 0}
        />

        <FormSelect
          label="Industry"
          options={industries}
          value={formData.industry}
          onChange={(e) => onChange('industry', e.target.value)}
          isValid={formData.industry.length > 0}
        />

        <div className="md:col-span-2">
          <FormInput
            label="Employer Name / Institution"
            placeholder="Name of your company, university, or institution"
            value={formData.employerName}
            onChange={(e) => onChange('employerName', e.target.value)}
            isValid={formData.employerName.length > 0}
          />
        </div>

        <div className="md:col-span-2">
          <FormSelect
            label="Work Environment"
            options={workEnvironments}
            value={formData.workEnvironment}
            onChange={(e) => onChange('workEnvironment', e.target.value)}
            isValid={formData.workEnvironment.length > 0}
          />
        </div>
      </div>

      {isStudent && (
        <div className="bg-gradient-to-br from-[#EAF2FF] to-white border-2 border-[#003DA5] rounded-2xl p-6 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#003DA5] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#002B7F] mb-2" style={{ fontWeight: 600 }}>
                Recommended Add-On: Study Interruption Protection
              </h3>
              <p className="text-[#475467] mb-4">
                Protect your education investment. Get coverage for tuition fees if serious injury forces you to interrupt your studies.
              </p>
              <div className="flex items-center gap-2 text-[#003DA5]">
                <Info className="w-5 h-5" />
                <span className="text-sm" style={{ fontWeight: 600 }}>You can add this in the next step</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#F9FAFB] border border-[#E4E7EC] rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#003DA5] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[#002B7F] mb-1" style={{ fontWeight: 600 }}>
              Why we ask about your occupation
            </h4>
            <p className="text-[#475467] text-sm">
              Your occupation helps us assess risk and recommend the most suitable coverage. High-risk occupations may have different premium rates to ensure adequate protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
