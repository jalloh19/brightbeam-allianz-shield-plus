import { Upload } from 'lucide-react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';

interface Step3Props {
  formData: {
    identificationType: string;
    identificationNumber: string;
    expiryDate: string;
    countryOfIssue: string;
  };
  onChange: (field: string, value: string) => void;
}

const identificationTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'residence-permit', label: 'Residence Permit' },
  { value: 'work-permit', label: 'Work Permit' },
  { value: 'student-pass', label: 'Student Pass' },
  { value: 'other', label: 'Other' },
];

const countries = [
  { value: 'china', label: 'China' },
  { value: 'india', label: 'India' },
  { value: 'indonesia', label: 'Indonesia' },
  { value: 'philippines', label: 'Philippines' },
  { value: 'bangladesh', label: 'Bangladesh' },
  { value: 'myanmar', label: 'Myanmar' },
  { value: 'vietnam', label: 'Vietnam' },
  { value: 'thailand', label: 'Thailand' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'south-korea', label: 'South Korea' },
  { value: 'japan', label: 'Japan' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'usa', label: 'United States' },
  { value: 'australia', label: 'Australia' },
  { value: 'other', label: 'Other' },
];

export function Step3Identity({ formData, onChange }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <FormSelect
          label="Identification Type"
          options={identificationTypes}
          value={formData.identificationType}
          onChange={(e) => onChange('identificationType', e.target.value)}
          isValid={formData.identificationType.length > 0}
        />

        <FormInput
          label="Identification Number"
          placeholder="Enter your ID number"
          value={formData.identificationNumber}
          onChange={(e) => onChange('identificationNumber', e.target.value)}
          isValid={formData.identificationNumber.length > 0}
        />

        <FormInput
          label="Expiry Date"
          type="date"
          value={formData.expiryDate}
          onChange={(e) => onChange('expiryDate', e.target.value)}
          isValid={formData.expiryDate.length > 0}
        />

        <FormSelect
          label="Country of Issue"
          options={countries}
          value={formData.countryOfIssue}
          onChange={(e) => onChange('countryOfIssue', e.target.value)}
          isValid={formData.countryOfIssue.length > 0}
        />
      </div>

      {/* Upload Card */}
      <div className="bg-gradient-to-br from-[#EAF2FF] to-white border-2 border-dashed border-[#003DA5] rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-md">
            <Upload className="w-8 h-8 text-[#003DA5]" />
          </div>
          <h3 className="text-[#002B7F] mb-2" style={{ fontWeight: 600 }}>
            Upload Passport for Auto Fill (Optional)
          </h3>
          <p className="text-[#475467] mb-4">
            Speed up your application by uploading a clear photo of your passport
          </p>
          <button className="px-6 py-3 bg-white border-2 border-[#003DA5] text-[#003DA5] rounded-xl hover:bg-[#EAF2FF] transition-all" style={{ fontWeight: 600 }}>
            Choose File
          </button>
          <p className="text-sm text-[#475467] mt-3">
            Supported: JPG, PNG, PDF (max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
}
