import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';

interface Step2Props {
  formData: {
    fullName: string;
    preferredName: string;
    dateOfBirth: string;
    age: string;
    gender: string;
    nationality: string;
    maritalStatus: string;
  };
  onChange: (field: string, value: string) => void;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const maritalOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const nationalityOptions = [
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

export function Step2PersonalInfo({ formData, onChange }: Step2Props) {
  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleDOBChange = (value: string) => {
    onChange('dateOfBirth', value);
    const age = calculateAge(value);
    onChange('age', age);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <FormInput
        label="Full Name (as per Passport)"
        placeholder="Enter your full legal name"
        value={formData.fullName}
        onChange={(e) => onChange('fullName', e.target.value)}
        isValid={formData.fullName.length > 0}
      />

      <FormInput
        label="Preferred Name"
        placeholder="What should we call you?"
        value={formData.preferredName}
        onChange={(e) => onChange('preferredName', e.target.value)}
        isValid={formData.preferredName.length > 0}
      />

      <FormInput
        label="Date of Birth"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => handleDOBChange(e.target.value)}
        isValid={formData.dateOfBirth.length > 0}
      />

      <FormInput
        label="Age"
        value={formData.age}
        disabled
        placeholder="Auto-calculated"
        className="bg-[#F9FAFB] cursor-not-allowed"
      />

      <FormSelect
        label="Gender"
        options={genderOptions}
        value={formData.gender}
        onChange={(e) => onChange('gender', e.target.value)}
        isValid={formData.gender.length > 0}
      />

      <FormSelect
        label="Nationality"
        options={nationalityOptions}
        value={formData.nationality}
        onChange={(e) => onChange('nationality', e.target.value)}
        isValid={formData.nationality.length > 0}
      />

      <div className="md:col-span-2">
        <FormSelect
          label="Marital Status"
          options={maritalOptions}
          value={formData.maritalStatus}
          onChange={(e) => onChange('maritalStatus', e.target.value)}
          isValid={formData.maritalStatus.length > 0}
        />
      </div>
    </div>
  );
}
