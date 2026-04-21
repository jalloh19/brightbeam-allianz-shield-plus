import { Check, Shield, Globe, Heart } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  coverage: string;
  price: number;
  isPopular?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'plan5',
    name: 'Plan 5',
    coverage: 'RM360,000',
    price: 360,
    features: [
      'Accidental death coverage',
      'Permanent disability protection',
      'Worldwide coverage',
      '24/7 support',
    ],
  },
  {
    id: 'plan6',
    name: 'Plan 6',
    coverage: 'RM600,000',
    price: 600,
    isPopular: true,
    features: [
      'Accidental death coverage',
      'Permanent disability protection',
      'Worldwide coverage',
      '24/7 support',
      'Medical expense benefit',
    ],
  },
  {
    id: 'plan7',
    name: 'Plan 7',
    coverage: 'RM900,000',
    price: 900,
    features: [
      'Accidental death coverage',
      'Permanent disability protection',
      'Worldwide coverage',
      '24/7 support',
      'Medical expense benefit',
      'Funeral expense benefit',
    ],
  },
];

interface Step1Props {
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
}

export function Step1PlanSelection({ selectedPlan, onSelectPlan }: Step1Props) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          onClick={() => onSelectPlan(plan.id)}
          className={`relative cursor-pointer bg-white rounded-2xl p-6 transition-all duration-200 ${
            selectedPlan === plan.id
              ? 'border-2 border-[#003DA5] shadow-xl ring-4 ring-[#EAF2FF]'
              : 'border-2 border-[#E4E7EC] shadow-md hover:shadow-lg hover:border-[#003DA5]/30'
          }`}
        >
          {plan.isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#003DA5] to-[#002B7F] text-white rounded-full text-sm" style={{ fontWeight: 600 }}>
              Most Popular
            </div>
          )}

          <div className="text-center mb-6 pt-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#EAF2FF] rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#003DA5]" />
            </div>
            <h3 className="text-2xl text-[#002B7F] mb-2" style={{ fontWeight: 700 }}>
              {plan.name}
            </h3>
            <div className="text-4xl text-[#003DA5] mb-1" style={{ fontWeight: 700 }}>
              {plan.coverage}
            </div>
            <div className="text-[#475467]">coverage</div>
          </div>

          <div className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#12B76A] flex-shrink-0 mt-0.5" />
                <span className="text-[#475467] text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <button
            className={`w-full py-3 rounded-xl transition-all duration-200 ${
              selectedPlan === plan.id
                ? 'bg-[#003DA5] text-white'
                : 'bg-[#EAF2FF] text-[#003DA5] hover:bg-[#003DA5] hover:text-white'
            }`}
            style={{ fontWeight: 600 }}
          >
            {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
          </button>
        </div>
      ))}
    </div>
  );
}
