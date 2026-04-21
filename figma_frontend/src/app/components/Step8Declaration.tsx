import { CheckCircle2, Shield } from 'lucide-react';
import { useState } from 'react';

interface Step8Props {
  orderSummary: {
    plan: string;
    planPrice: number;
    addOns: string[];
    total: number;
  };
  applicantInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export function Step8Declaration({ orderSummary, applicantInfo }: Step8Props) {
  const [declarations, setDeclarations] = useState({
    accuracy: false,
    privacy: false,
    communication: false,
    underwriting: false,
  });

  const allChecked = Object.values(declarations).every((val) => val);

  const toggleDeclaration = (key: keyof typeof declarations) => {
    setDeclarations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Declarations */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border-2 border-[#E4E7EC] p-6 space-y-4">
          <h3 className="text-[#002B7F] mb-4" style={{ fontWeight: 700 }}>
            Declaration & Consent
          </h3>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={declarations.accuracy}
                onChange={() => toggleDeclaration('accuracy')}
                className="w-6 h-6 rounded border-2 border-[#E4E7EC] text-[#003DA5] focus:ring-2 focus:ring-[#003DA5] cursor-pointer"
              />
              {declarations.accuracy && (
                <CheckCircle2 className="absolute inset-0 w-6 h-6 text-[#12B76A] pointer-events-none" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-[#002B7F] group-hover:text-[#003DA5] transition-colors" style={{ fontWeight: 600 }}>
                Information Accuracy
              </div>
              <p className="text-[#475467] text-sm mt-1">
                I declare that all information provided in this application is true, accurate, and complete to the best of my knowledge.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={declarations.privacy}
                onChange={() => toggleDeclaration('privacy')}
                className="w-6 h-6 rounded border-2 border-[#E4E7EC] text-[#003DA5] focus:ring-2 focus:ring-[#003DA5] cursor-pointer"
              />
              {declarations.privacy && (
                <CheckCircle2 className="absolute inset-0 w-6 h-6 text-[#12B76A] pointer-events-none" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-[#002B7F] group-hover:text-[#003DA5] transition-colors" style={{ fontWeight: 600 }}>
                Privacy Policy
              </div>
              <p className="text-[#475467] text-sm mt-1">
                I have read and agree to Allianz Malaysia's{' '}
                <span className="text-[#003DA5] underline">Privacy Policy</span> and{' '}
                <span className="text-[#003DA5] underline">Terms & Conditions</span>.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={declarations.communication}
                onChange={() => toggleDeclaration('communication')}
                className="w-6 h-6 rounded border-2 border-[#E4E7EC] text-[#003DA5] focus:ring-2 focus:ring-[#003DA5] cursor-pointer"
              />
              {declarations.communication && (
                <CheckCircle2 className="absolute inset-0 w-6 h-6 text-[#12B76A] pointer-events-none" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-[#002B7F] group-hover:text-[#003DA5] transition-colors" style={{ fontWeight: 600 }}>
                Marketing Communications
              </div>
              <p className="text-[#475467] text-sm mt-1">
                I consent to receiving policy updates, renewal notices, and promotional offers from Allianz via email, SMS, or phone.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={declarations.underwriting}
                onChange={() => toggleDeclaration('underwriting')}
                className="w-6 h-6 rounded border-2 border-[#E4E7EC] text-[#003DA5] focus:ring-2 focus:ring-[#003DA5] cursor-pointer"
              />
              {declarations.underwriting && (
                <CheckCircle2 className="absolute inset-0 w-6 h-6 text-[#12B76A] pointer-events-none" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-[#002B7F] group-hover:text-[#003DA5] transition-colors" style={{ fontWeight: 600 }}>
                Underwriting Approval
              </div>
              <p className="text-[#475467] text-sm mt-1">
                I understand that this application is subject to underwriting approval and Allianz Malaysia reserves the right to request additional information or medical examination.
              </p>
            </div>
          </label>
        </div>

        <div className="bg-gradient-to-br from-[#EAF2FF] to-white border-2 border-[#003DA5] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-[#003DA5] flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-[#002B7F] mb-2" style={{ fontWeight: 600 }}>
                Your Information is Protected
              </h4>
              <p className="text-[#475467] text-sm">
                Protected by PIDM up to specified limits. Subject to Allianz Malaysia Privacy Policy. Your personal data is encrypted and stored securely in compliance with Malaysian data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border-2 border-[#E4E7EC] p-6 space-y-4 sticky top-24">
          <h3 className="text-[#002B7F] mb-4" style={{ fontWeight: 700 }}>
            Application Summary
          </h3>

          <div className="space-y-3 pb-4 border-b border-[#E4E7EC]">
            <div>
              <div className="text-xs text-[#475467] mb-1">Applicant Name</div>
              <div className="text-[#002B7F]" style={{ fontWeight: 600 }}>
                {applicantInfo.name}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#475467] mb-1">Email</div>
              <div className="text-[#002B7F]" style={{ fontWeight: 600 }}>
                {applicantInfo.email}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#475467] mb-1">Phone</div>
              <div className="text-[#002B7F]" style={{ fontWeight: 600 }}>
                {applicantInfo.phone}
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-4 border-b border-[#E4E7EC]">
            <div>
              <div className="text-xs text-[#475467] mb-1">Selected Plan</div>
              <div className="text-[#002B7F]" style={{ fontWeight: 600 }}>
                {orderSummary.plan}
              </div>
            </div>
            {orderSummary.addOns.length > 0 && (
              <div>
                <div className="text-xs text-[#475467] mb-1">Add-ons</div>
                <div className="text-[#002B7F] text-sm" style={{ fontWeight: 600 }}>
                  {orderSummary.addOns.join(', ')}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-[#002B7F]" style={{ fontWeight: 700 }}>Total Premium</span>
            <span className="text-[#003DA5] text-xl" style={{ fontWeight: 700 }}>
              RM{orderSummary.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
