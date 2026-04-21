import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ProgressBar } from './components/ProgressBar';
import { StepContainer } from './components/StepContainer';
import { Step1PlanSelection } from './components/Step1PlanSelection';
import { Step2PersonalInfo } from './components/Step2PersonalInfo';
import { Step3Identity } from './components/Step3Identity';
import { Step4Contact } from './components/Step4Contact';
import { Step5Occupation } from './components/Step5Occupation';
import { Step6Benefits } from './components/Step6Benefits';
import { Step7Payment } from './components/Step7Payment';
import { Step8Declaration } from './components/Step8Declaration';
import { CheckCircle } from 'lucide-react';

type FormStep = 'landing' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'success';

export default function App() {
  const [currentStep, setCurrentStep] = useState<FormStep>('landing');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
  });

  const [identityInfo, setIdentityInfo] = useState({
    identificationType: '',
    identificationNumber: '',
    expiryDate: '',
    countryOfIssue: '',
  });

  const [contactInfo, setContactInfo] = useState({
    countryCode: '',
    mobileNumber: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  });

  const [occupationInfo, setOccupationInfo] = useState({
    occupation: '',
    industry: '',
    employerName: '',
    workEnvironment: '',
  });

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleIdentityChange = (field: string, value: string) => {
    setIdentityInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleOccupationChange = (field: string, value: string) => {
    setOccupationInfo((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBenefit = (benefitId: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefitId)
        ? prev.filter((id) => id !== benefitId)
        : [...prev, benefitId]
    );
  };

  const getPlanDetails = () => {
    const plans: Record<string, { name: string; price: number }> = {
      plan5: { name: 'Plan 5 (RM360,000)', price: 360 },
      plan6: { name: 'Plan 6 (RM600,000)', price: 600 },
      plan7: { name: 'Plan 7 (RM900,000)', price: 900 },
    };
    return plans[selectedPlan] || { name: '', price: 0 };
  };

  const getBenefitDetails = () => {
    const benefits: Record<string, { name: string; price: number }> = {
      lifestyle: { name: 'Lifestyle & Living', price: 120 },
      study: { name: 'Study Interruption', price: 150 },
      family: { name: 'Family Cover', price: 300 },
      traveler: { name: 'Frequent Traveler Assistance', price: 200 },
    };

    const selectedBenefitDetails = selectedBenefits.map((id) => ({
      name: benefits[id]?.name || '',
      price: benefits[id]?.price || 0,
    }));

    const totalPrice = selectedBenefitDetails.reduce((sum, b) => sum + b.price, 0);
    const names = selectedBenefitDetails.map((b) => b.name);

    return { names, totalPrice };
  };

  const calculateOrderSummary = () => {
    const plan = getPlanDetails();
    const benefits = getBenefitDetails();
    const subtotal = plan.price + benefits.totalPrice;
    const bonus = Math.round(subtotal * 0.25);
    const total = subtotal;

    return {
      plan: plan.name,
      planPrice: plan.price,
      addOns: benefits.names,
      addOnPrice: benefits.totalPrice,
      bonus,
      total,
    };
  };

  const isStep1Valid = selectedPlan !== '';
  const isStep2Valid = personalInfo.fullName && personalInfo.dateOfBirth && personalInfo.gender && personalInfo.nationality;
  const isStep3Valid = identityInfo.identificationType && identityInfo.identificationNumber && identityInfo.expiryDate;
  const isStep4Valid = contactInfo.email && contactInfo.mobileNumber && contactInfo.addressLine1 && contactInfo.city;
  const isStep5Valid = occupationInfo.occupation && occupationInfo.industry && occupationInfo.employerName;

  if (currentStep === 'landing') {
    return <LandingPage onStartApplication={() => setCurrentStep(1)} />;
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EAF2FF] to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#12B76A] to-[#0D9B5A] rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl text-[#002B7F] mb-4" style={{ fontWeight: 700 }}>
            Application Submitted Successfully!
          </h1>
          <p className="text-lg text-[#475467] mb-8">
            Thank you for choosing Allianz Shield Plus. Your application reference number is <span className="text-[#003DA5]" style={{ fontWeight: 600 }}>ASP-{Math.floor(Math.random() * 1000000)}</span>
          </p>
          <div className="bg-[#EAF2FF] rounded-2xl p-6 mb-8">
            <h3 className="text-[#002B7F] mb-4" style={{ fontWeight: 600 }}>What Happens Next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#003DA5] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm" style={{ fontWeight: 600 }}>1</span>
                </div>
                <p className="text-[#475467]">You'll receive a confirmation email within 5 minutes</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#003DA5] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm" style={{ fontWeight: 600 }}>2</span>
                </div>
                <p className="text-[#475467]">Our team will review your application within 24-48 hours</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#003DA5] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm" style={{ fontWeight: 600 }}>3</span>
                </div>
                <p className="text-[#475467]">Once approved, your policy documents will be sent via email</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-[#003DA5] hover:bg-[#002B7F] text-white rounded-xl transition-all shadow-lg"
            style={{ fontWeight: 600 }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF2FF] to-white">
      <ProgressBar currentStep={currentStep as number} totalSteps={8} />

      {currentStep === 1 && (
        <StepContainer
          title="Choose Your Protection Plan"
          description="Select the coverage that best fits your needs"
          onNext={() => setCurrentStep(2)}
          isNextDisabled={!isStep1Valid}
          showBack={false}
        >
          <Step1PlanSelection selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
        </StepContainer>
      )}

      {currentStep === 2 && (
        <StepContainer
          title="Personal Information"
          description="Tell us about yourself"
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
          isNextDisabled={!isStep2Valid}
        >
          <Step2PersonalInfo formData={personalInfo} onChange={handlePersonalInfoChange} />
        </StepContainer>
      )}

      {currentStep === 3 && (
        <StepContainer
          title="Identity Verification"
          description="Verify your identity documents"
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
          isNextDisabled={!isStep3Valid}
        >
          <Step3Identity formData={identityInfo} onChange={handleIdentityChange} />
        </StepContainer>
      )}

      {currentStep === 4 && (
        <StepContainer
          title="Contact & Address"
          description="How can we reach you?"
          onNext={() => setCurrentStep(5)}
          onBack={() => setCurrentStep(3)}
          isNextDisabled={!isStep4Valid}
        >
          <Step4Contact formData={contactInfo} onChange={handleContactChange} />
        </StepContainer>
      )}

      {currentStep === 5 && (
        <StepContainer
          title="Occupation & Lifestyle"
          description="Help us understand your daily activities"
          onNext={() => setCurrentStep(6)}
          onBack={() => setCurrentStep(4)}
          isNextDisabled={!isStep5Valid}
        >
          <Step5Occupation formData={occupationInfo} onChange={handleOccupationChange} />
        </StepContainer>
      )}

      {currentStep === 6 && (
        <StepContainer
          title="Optional Benefits"
          description="Enhance your coverage with additional protection"
          onNext={() => setCurrentStep(7)}
          onBack={() => setCurrentStep(5)}
        >
          <Step6Benefits selectedBenefits={selectedBenefits} onToggleBenefit={toggleBenefit} />
        </StepContainer>
      )}

      {currentStep === 7 && (
        <StepContainer
          title="Payment Method"
          description="Choose how you'd like to pay"
          onNext={() => setCurrentStep(8)}
          onBack={() => setCurrentStep(6)}
        >
          <Step7Payment orderSummary={calculateOrderSummary()} />
        </StepContainer>
      )}

      {currentStep === 8 && (
        <StepContainer
          title="Declaration & Submit"
          description="Review and confirm your application"
          onNext={() => setCurrentStep('success')}
          onBack={() => setCurrentStep(7)}
          nextLabel="Submit Application"
        >
          <Step8Declaration
            orderSummary={calculateOrderSummary()}
            applicantInfo={{
              name: personalInfo.fullName || 'Not provided',
              email: contactInfo.email || 'Not provided',
              phone: `${contactInfo.countryCode} ${contactInfo.mobileNumber}` || 'Not provided',
            }}
          />
        </StepContainer>
      )}
    </div>
  );
}