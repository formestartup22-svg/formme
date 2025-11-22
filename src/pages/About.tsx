import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import NavBar from '@/components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8">
            <h1 className="text-6xl lg:text-7xl font-serif text-[#111827] leading-tight">
              Fashion is hard to break into.
            </h1>
            <h2 className="text-5xl lg:text-6xl font-serif text-[#111827] leading-tight">
              We're here to change that.
            </h2>
            <p className="text-xl text-[#4B5563] max-w-3xl mx-auto leading-relaxed">
              Formme is the all-in-one platform for designing, manufacturing, and selling fashion, without the barriers.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 px-4 bg-[#F9FAFB]">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-4xl font-serif text-[#111827] text-center mb-12">
            What we offer
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">No MOQs</h4>
              <p className="text-[#4B5563] leading-relaxed">
                Start small, scale as you grow. No minimum order quantities means you can test your designs without massive upfront investment.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">A design studio that meets you where you are</h4>
              <p className="text-[#4B5563] leading-relaxed">
                Whether you're a beginner or a pro, our intuitive design tools adapt to your skill level and workflow.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">Transparent, ethical manufacturing</h4>
              <p className="text-[#4B5563] leading-relaxed">
                Know exactly where and how your pieces are made. We partner with vetted, ethical factories you can trust.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">On-demand production → zero inventory</h4>
              <p className="text-[#4B5563] leading-relaxed">
                Only produce what you sell. Eliminate the risk of unsold inventory and reduce waste.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">Predictable timelines</h4>
              <p className="text-[#4B5563] leading-relaxed">
                Clear production schedules and real-time updates keep you informed every step of the way.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">Instant storefront to sell your pieces</h4>
              <p className="text-[#4B5563] leading-relaxed">
                Connect with all Formme customers through our built-in marketplace. Start selling immediately.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">Full creative control</h4>
              <p className="text-[#4B5563] leading-relaxed">
                Your vision, your way. No compromises on your designs or brand identity.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h4 className="text-2xl font-semibold text-[#111827] mb-3">A team that understands how important this is</h4>
              <p className="text-[#4B5563] leading-relaxed">
                We're not just a platform—we're your partners in bringing your fashion dreams to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Panels Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#7B1E1E] rounded-3xl p-8 h-[350px] relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full opacity-20" />
              <p className="absolute bottom-8 left-8 text-white text-base font-light">
                Design Without Limits
              </p>
            </div>
            <div className="bg-[#0B1636] rounded-3xl p-8 h-[350px] relative overflow-hidden mt-12">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full opacity-20" />
              <p className="absolute bottom-8 left-8 text-white text-base font-light">
                Manufacture With Confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl font-serif text-[#111827] mb-6">
            Ready to start your fashion journey?
          </h2>
          <p className="text-lg text-[#4B5563] mb-8">
            Join the community of creators who are redefining what's possible in fashion.
          </p>
          <Link to="/designer">
            <Button className="bg-black hover:bg-[#111111] text-white px-8 py-6 rounded-full text-base">
              Start designing now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
