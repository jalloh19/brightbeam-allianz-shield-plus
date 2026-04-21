import { Shield, Globe, Heart, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onStartApplication: () => void;
}

export function LandingPage({ onStartApplication }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF2FF] to-white">
      {/* Anniversary Banner */}
      <div className="bg-gradient-to-r from-[#003DA5] to-[#002B7F] text-white py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <span>25th Anniversary Offer — Get 25% Special Bonus Today</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl tracking-tight text-[#002B7F]" style={{ fontWeight: 700, lineHeight: 1.1 }}>
                Protect Your Stay in Malaysia with Allianz Shield Plus
              </h1>
              <p className="text-xl text-[#475467]" style={{ lineHeight: 1.6 }}>
                24/7 worldwide personal accident coverage for foreign residents, workers, students, and families.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-[#E4E7EC]">
                <div className="flex-shrink-0 w-12 h-12 bg-[#EAF2FF] rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#003DA5]" />
                </div>
                <div>
                  <h3 className="text-[#002B7F] mb-1" style={{ fontWeight: 600 }}>Up to RM900,000 coverage</h3>
                  <p className="text-[#475467]">Comprehensive protection for accidental death and permanent disability</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-[#E4E7EC]">
                <div className="flex-shrink-0 w-12 h-12 bg-[#EAF2FF] rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#003DA5]" />
                </div>
                <div>
                  <h3 className="text-[#002B7F] mb-1" style={{ fontWeight: 600 }}>Cashless hospital support</h3>
                  <p className="text-[#475467]">Direct billing at panel hospitals across Malaysia</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-[#E4E7EC]">
                <div className="flex-shrink-0 w-12 h-12 bg-[#EAF2FF] rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-[#003DA5]" />
                </div>
                <div>
                  <h3 className="text-[#002B7F] mb-1" style={{ fontWeight: 600 }}>Worldwide protection</h3>
                  <p className="text-[#475467]">Coverage extends globally, wherever you travel</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-[#E4E7EC]">
                <div className="flex-shrink-0 w-12 h-12 bg-[#EAF2FF] rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#003DA5]" />
                </div>
                <div>
                  <h3 className="text-[#002B7F] mb-1" style={{ fontWeight: 600 }}>Fast online application</h3>
                  <p className="text-[#475467]">Get covered in minutes with our streamlined process</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onStartApplication}
                className="px-8 py-4 bg-[#003DA5] hover:bg-[#002B7F] text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ fontWeight: 600 }}
              >
                Start Application
              </button>
              <button
                className="px-8 py-4 border-2 border-[#003DA5] text-[#003DA5] hover:bg-[#EAF2FF] rounded-xl transition-all duration-200"
                style={{ fontWeight: 600 }}
              >
                View Plans
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#003DA5] to-[#002B7F] rounded-3xl p-12 shadow-2xl">
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-6">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Globe className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <div className="text-white/90 text-lg">Trusted by over</div>
                <div className="text-white text-4xl mt-2" style={{ fontWeight: 700 }}>500,000+</div>
                <div className="text-white/90 text-lg mt-1">foreign residents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
