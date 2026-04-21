import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';

interface Step4Props {
  formData: {
    countryCode: string;
    mobileNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  onChange: (field: string, value: string) => void;
}

const countryCodes = [
  { value: '+60', label: '+60 (Malaysia)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+62', label: '+62 (Indonesia)' },
  { value: '+63', label: '+63 (Philippines)' },
  { value: '+880', label: '+880 (Bangladesh)' },
  { value: '+95', label: '+95 (Myanmar)' },
  { value: '+84', label: '+84 (Vietnam)' },
  { value: '+66', label: '+66 (Thailand)' },
  { value: '+65', label: '+65 (Singapore)' },
];

const malaysianStates = [
  { value: 'kuala-lumpur', label: 'Kuala Lumpur' },
  { value: 'selangor', label: 'Selangor' },
  { value: 'penang', label: 'Penang' },
  { value: 'johor', label: 'Johor' },
  { value: 'perak', label: 'Perak' },
  { value: 'sabah', label: 'Sabah' },
  { value: 'sarawak', label: 'Sarawak' },
  { value: 'melaka', label: 'Melaka' },
  { value: 'negeri-sembilan', label: 'Negeri Sembilan' },
  { value: 'pahang', label: 'Pahang' },
  { value: 'kelantan', label: 'Kelantan' },
  { value: 'terengganu', label: 'Terengganu' },
  { value: 'kedah', label: 'Kedah' },
  { value: 'perlis', label: 'Perlis' },
  { value: 'putrajaya', label: 'Putrajaya' },
  { value: 'labuan', label: 'Labuan' },
];

const countries = [
  { value: 'malaysia', label: 'Malaysia' },
];

export function Step4Contact({ formData, onChange }: Step4Props) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <FormSelect
          label="Country Code"
          options={countryCodes}
          value={formData.countryCode}
          onChange={(e) => onChange('countryCode', e.target.value)}
          isValid={formData.countryCode.length > 0}
        />

        <div className="md:col-span-2">
          <FormInput
            label="Mobile Number"
            placeholder="123456789"
            value={formData.mobileNumber}
            onChange={(e) => onChange('mobileNumber', e.target.value)}
            isValid={formData.mobileNumber.length > 0}
          />
        </div>
      </div>

      <FormInput
        label="Email Address"
        type="email"
        placeholder="your.email@example.com"
        value={formData.email}
        onChange={(e) => onChange('email', e.target.value)}
        isValid={formData.email.length > 0 && formData.email.includes('@')}
      />

      <div className="pt-4">
        <h3 className="text-[#002B7F] mb-4" style={{ fontWeight: 600 }}>
          Current Address in Malaysia
        </h3>

        <div className="space-y-4">
          <FormInput
            label="Address Line 1"
            placeholder="Street address, building name, unit number"
            value={formData.addressLine1}
            onChange={(e) => onChange('addressLine1', e.target.value)}
            isValid={formData.addressLine1.length > 0}
          />

          <FormInput
            label="Address Line 2 (Optional)"
            placeholder="Additional address information"
            value={formData.addressLine2}
            onChange={(e) => onChange('addressLine2', e.target.value)}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="City"
              placeholder="e.g., Kuala Lumpur"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              isValid={formData.city.length > 0}
            />

            <FormSelect
              label="State"
              options={malaysianStates}
              value={formData.state}
              onChange={(e) => onChange('state', e.target.value)}
              isValid={formData.state.length > 0}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Postcode"
              placeholder="e.g., 50450"
              value={formData.postcode}
              onChange={(e) => onChange('postcode', e.target.value)}
              isValid={formData.postcode.length > 0}
            />

            <FormSelect
              label="Country"
              options={countries}
              value={formData.country}
              onChange={(e) => onChange('country', e.target.value)}
              isValid={formData.country.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
