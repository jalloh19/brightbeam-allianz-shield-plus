import { CreditCard, Building2, Smartphone, UserCircle } from 'lucide-react';
import { FormInput } from './FormInput';
import { useState } from 'react';

interface Step7Props {
  orderSummary: {
    plan: string;
    planPrice: number;
    addOns: string[];
    addOnPrice: number;
    bonus: number;
    total: number;
  };
}

export function Step7Payment({ orderSummary }: Step7Props) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'fpx' | 'ewallet' | 'agent'>('card');

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Payment Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Payment Method Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-[#003DA5] bg-[#EAF2FF] text-[#003DA5]'
                : 'border-[#E4E7EC] bg-white text-[#475467] hover:border-[#003DA5]/30'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm" style={{ fontWeight: 600 }}>Card</div>
          </button>

          <button
            onClick={() => setPaymentMethod('fpx')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'fpx'
                ? 'border-[#003DA5] bg-[#EAF2FF] text-[#003DA5]'
                : 'border-[#E4E7EC] bg-white text-[#475467] hover:border-[#003DA5]/30'
            }`}
          >
            <Building2 className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm" style={{ fontWeight: 600 }}>FPX</div>
          </button>

          <button
            onClick={() => setPaymentMethod('ewallet')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'ewallet'
                ? 'border-[#003DA5] bg-[#EAF2FF] text-[#003DA5]'
                : 'border-[#E4E7EC] bg-white text-[#475467] hover:border-[#003DA5]/30'
            }`}
          >
            <Smartphone className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm" style={{ fontWeight: 600 }}>E-Wallet</div>
          </button>

          <button
            onClick={() => setPaymentMethod('agent')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'agent'
                ? 'border-[#003DA5] bg-[#EAF2FF] text-[#003DA5]'
                : 'border-[#E4E7EC] bg-white text-[#475467] hover:border-[#003DA5]/30'
            }`}
          >
            <UserCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm" style={{ fontWeight: 600 }}>Agent</div>
          </button>
        </div>

        {/* Payment Form */}
        {paymentMethod === 'card' && (
          <div className="bg-white rounded-2xl border-2 border-[#E4E7EC] p-6 space-y-4">
            <FormInput
              label="Card Number"
              placeholder="1234 5678 9012 3456"
            />
            <FormInput
              label="Cardholder Name"
              placeholder="Name on card"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Expiry Date"
                placeholder="MM/YY"
              />
              <FormInput
                label="CVV"
                placeholder="123"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'fpx' && (
          <div className="bg-white rounded-2xl border-2 border-[#E4E7EC] p-6">
            <p className="text-[#475467] mb-4">
              You will be redirected to your bank's FPX portal to complete the payment securely.
            </p>
            <FormInput
              label="Select Your Bank"
              placeholder="Choose your bank..."
            />
          </div>
        )}

        {paymentMethod === 'ewallet' && (
          <div className="bg-white rounded-2xl border-2 border-[#E4E7EC] p-6 space-y-4">
            <p className="text-[#475467] mb-4">
              Select your preferred e-wallet service
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 border-2 border-[#E4E7EC] rounded-xl hover:border-[#003DA5] transition-all">
                <div style={{ fontWeight: 600 }}>Touch 'n Go</div>
              </button>
              <button className="p-4 border-2 border-[#E4E7EC] rounded-xl hover:border-[#003DA5] transition-all">
                <div style={{ fontWeight: 600 }}>GrabPay</div>
              </button>
              <button className="p-4 border-2 border-[#E4E7EC] rounded-xl hover:border-[#003DA5] transition-all">
                <div style={{ fontWeight: 600 }}>Boost</div>
              </button>
              <button className="p-4 border-2 border-[#E4E7EC] rounded-xl hover:border-[#003DA5] transition-all">
                <div style={{ fontWeight: 600 }}>ShopeePay</div>
              </button>
            </div>
          </div>
        )}

        {paymentMethod === 'agent' && (
          <div className="bg-white rounded-2xl border-2 border-[#E4E7EC] p-6">
            <h3 className="text-[#002B7F] mb-4" style={{ fontWeight: 600 }}>
              Agent Follow-up
            </h3>
            <p className="text-[#475467] mb-4">
              Our licensed Allianz agent will contact you within 24 hours to assist with payment and answer any questions about your coverage.
            </p>
            <FormInput
              label="Preferred Contact Time"
              placeholder="e.g., Weekday mornings, Weekend afternoons"
            />
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-[#EAF2FF] to-white rounded-2xl border-2 border-[#003DA5] p-6 sticky top-24">
          <h3 className="text-[#002B7F] mb-4" style={{ fontWeight: 700 }}>
            Order Summary
          </h3>

          <div className="space-y-3 mb-4 pb-4 border-b border-[#E4E7EC]">
            <div className="flex justify-between">
              <span className="text-[#475467]">{orderSummary.plan}</span>
              <span className="text-[#002B7F]" style={{ fontWeight: 600 }}>
                RM{orderSummary.planPrice}
              </span>
            </div>

            {orderSummary.addOns.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-sm text-[#475467]" style={{ fontWeight: 600 }}>Add-ons:</div>
                {orderSummary.addOns.map((addon, index) => (
                  <div key={index} className="flex justify-between text-sm pl-2">
                    <span className="text-[#475467]">{addon}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1">
                  <span className="text-[#475467]">Total Add-ons</span>
                  <span className="text-[#002B7F]" style={{ fontWeight: 600 }}>
                    RM{orderSummary.addOnPrice}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-[#E4E7EC]">
            <div className="flex justify-between">
              <span className="text-[#475467]">Subtotal</span>
              <span className="text-[#002B7F]" style={{ fontWeight: 600 }}>
                RM{orderSummary.planPrice + orderSummary.addOnPrice}
              </span>
            </div>
            <div className="flex justify-between text-[#12B76A]">
              <span>25% Anniversary Bonus</span>
              <span style={{ fontWeight: 600 }}>+RM{orderSummary.bonus}</span>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-[#002B7F] text-lg" style={{ fontWeight: 700 }}>Total</span>
            <span className="text-[#003DA5] text-2xl" style={{ fontWeight: 700 }}>
              RM{orderSummary.total}
            </span>
          </div>

          <div className="text-xs text-[#475467] text-center">
            Billed annually
          </div>
        </div>
      </div>
    </div>
  );
}
