import { Smartphone, GraduationCap, Users, Plane, Star } from 'lucide-react';

interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  price: number;
}

const benefits: Benefit[] = [
  {
    id: 'lifestyle',
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Lifestyle & Living',
    description: 'Protect your devices, gadgets, and online purchases against theft, damage, and fraud.',
    price: 120,
  },
  {
    id: 'study',
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Study Interruption',
    description: 'Coverage for tuition fees if serious injury forces interruption of your studies.',
    price: 150,
  },
  {
    id: 'family',
    icon: <Users className="w-6 h-6" />,
    title: 'Family Cover',
    description: 'Extend protection to your spouse and children. Enjoy up to 50% family discount.',
    price: 300,
  },
  {
    id: 'traveler',
    icon: <Plane className="w-6 h-6" />,
    title: 'Frequent Traveler Assistance',
    description: 'Medical evacuation, repatriation, and emergency travel assistance worldwide.',
    price: 200,
  },
];

interface Step6Props {
  selectedBenefits: string[];
  onToggleBenefit: (benefitId: string) => void;
}

export function Step6Benefits({ selectedBenefits, onToggleBenefit }: Step6Props) {
  return (
    <div className="space-y-6">
      {/* Campaign Banner */}
      <div className="bg-gradient-to-r from-[#003DA5] to-[#002B7F] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Star className="w-6 h-6 text-yellow-300" />
          <h3 style={{ fontWeight: 700 }}>25th Anniversary Special</h3>
        </div>
        <p className="text-white/90">
          Add Lifestyle & Living benefit today and enjoy an extra 25% coverage bonus at no additional cost!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {benefits.map((benefit) => {
          const isSelected = selectedBenefits.includes(benefit.id);
          const isLifestyle = benefit.id === 'lifestyle';

          return (
            <div
              key={benefit.id}
              onClick={() => onToggleBenefit(benefit.id)}
              className={`relative cursor-pointer bg-white rounded-2xl p-6 transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-[#003DA5] shadow-lg ring-4 ring-[#EAF2FF]'
                  : 'border-2 border-[#E4E7EC] shadow-md hover:shadow-lg hover:border-[#003DA5]/30'
              }`}
            >
              {isLifestyle && (
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-6 h-6 text-white" />
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-[#003DA5] text-white' : 'bg-[#EAF2FF] text-[#003DA5]'
                }`}>
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-[#002B7F] mb-1" style={{ fontWeight: 700 }}>
                    {benefit.title}
                  </h3>
                  <div className="text-[#003DA5]" style={{ fontWeight: 600 }}>
                    +RM{benefit.price}/year
                  </div>
                </div>
              </div>

              <p className="text-[#475467] mb-4">
                {benefit.description}
              </p>

              <button
                className={`w-full py-2.5 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#003DA5] text-white'
                    : 'bg-[#EAF2FF] text-[#003DA5] hover:bg-[#003DA5] hover:text-white'
                }`}
                style={{ fontWeight: 600 }}
              >
                {isSelected ? 'Added' : 'Add Benefit'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-[#F9FAFB] border border-[#E4E7EC] rounded-xl p-5">
        <h4 className="text-[#002B7F] mb-2" style={{ fontWeight: 600 }}>
          Flexible Protection
        </h4>
        <p className="text-[#475467]">
          You can add or remove these optional benefits at any time during your policy period. Choose what matters most to you today, and adjust later as your needs change.
        </p>
      </div>
    </div>
  );
}
