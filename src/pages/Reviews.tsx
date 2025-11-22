import { Star, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import NavBar from '@/components/Navbar';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';

const Reviews = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [navbarDark, setNavbarDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // After scrolling 100px, transition to normal navbar
      if (window.scrollY > 100) {
        setNavbarDark(false);
      } else {
        setNavbarDark(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = () => {
    console.log('Message sent:', { email, message });
    setMessage('');
    setEmail('');
  };

  // Featured creator testimonials
  const featuredStories = [
    {
      name: 'Emma Johnson',
      brand: 'Luna Threads',
      quote: 'Formme transformed my design process. The factory matching was seamless and production quality exceeded expectations.',
    },
    {
      name: 'Michael Chen',
      brand: 'Urban Craft Co.',
      quote: 'Finally, a platform that understands both design and manufacturing. The tech pack generation saved me weeks of work.',
    },
  ];

  // Review cards data
  const reviews = [
    {
      id: 1,
      name: 'Emma Johnson',
      brand: 'Luna Threads',
      rating: 5,
      review: 'The factory matching system connected me with the perfect manufacturer. Production was smooth and quality amazing.',
    },
    {
      id: 2,
      name: 'Michael Chen',
      brand: 'Urban Craft Co.',
      rating: 5,
      review: 'AI tech pack generation is a game changer. What used to take days now takes minutes.',
    },
    {
      id: 3,
      name: 'Sophia Rodriguez',
      brand: 'Verde Studio',
      rating: 5,
      review: 'Finally launched my sustainable collection thanks to Formme. The end-to-end support was incredible.',
    },
    {
      id: 4,
      name: 'Lucas Wong',
      brand: 'Minimal Works',
      rating: 5,
      review: 'Professional quality tools without the enterprise price tag. Perfect for independent designers.',
    },
    {
      id: 5,
      name: 'Aisha Patel',
      brand: 'Heritage & Modern',
      rating: 5,
      review: 'The production dashboard kept everything organized. Communication with factories was seamless.',
    },
    {
      id: 6,
      name: 'Daniel Kim',
      brand: 'Street Culture',
      rating: 4,
      review: 'Great platform for emerging designers. Sample approval process was thorough and transparent.',
    },
    {
      id: 7,
      name: 'Isabella Martinez',
      brand: 'Eco Luxe',
      rating: 5,
      review: 'Loved the sustainable factory options. My brand values aligned perfectly with their manufacturing partners.',
    },
    {
      id: 8,
      name: 'James Taylor',
      brand: 'Athleisure Pro',
      rating: 5,
      review: 'From concept to finished product in record time. Quality control features gave me peace of mind.',
    },
  ];

  const renderRating = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />
      ));
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar initialDark={navbarDark} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-serif text-[#111827] leading-tight">
                What creators say about Formme
              </h1>
              <p className="text-lg text-[#4B5563] max-w-md">
                Join thousands of designers who trust Formme to bring their fashion visions to life with professional manufacturing support.
              </p>
              <Link to="/designer">
                <Button className="bg-black hover:bg-[#111111] text-white px-8 py-6 rounded-full text-base">
                  Start your brand
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Hero Panels */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#7B1E1E] rounded-3xl p-8 h-[400px] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full opacity-20" />
                <p className="absolute bottom-8 left-8 text-white text-sm font-light">
                  Premium Quality
                </p>
              </div>
              <div className="bg-[#0B1636] rounded-3xl p-8 h-[400px] relative overflow-hidden mt-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full opacity-20" />
                <p className="absolute bottom-8 left-8 text-white text-sm font-light">
                  Expert Craftsmanship
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="py-16 px-4 bg-[#F9FAFB]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-serif text-[#111827] mb-4">Featured creators</h2>
              <p className="text-[#4B5563]">
                See how independent designers and emerging brands are launching successful collections with Formme's end-to-end manufacturing platform.
              </p>
            </div>

            <div className="space-y-6">
              {featuredStories.map((story, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-[#111827]">{story.name}</h3>
                    <p className="text-sm text-[#4B5563]">{story.brand}</p>
                  </div>
                  <p className="text-[#111827]">"{story.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-serif text-[#111827] text-center mb-12">
            Creator stories
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#FBEFD3] p-6 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="font-bold text-[#111827] mb-1">{review.name}</h3>
                  <p className="text-sm text-[#4B5563] mb-3">{review.brand}</p>
                  <div className="flex gap-1">{renderRating(review.rating)}</div>
                </div>
                <p className="text-[#111827] text-sm leading-relaxed">"{review.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Formme Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif text-[#111827] mb-4">Get in touch</h2>
            <p className="text-lg text-[#4B5563]">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-[#E5E7EB]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Your message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="w-full min-h-[150px] px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                className="w-full bg-black hover:bg-[#111111] text-white px-8 py-6 rounded-full text-base"
              >
                Send message
                <Mail className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-12 px-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif text-[#111827] mb-4">
            Ready to launch your first collection?
          </h2>
          <Link to="/designer">
            <Button className="bg-black hover:bg-[#111111] text-white px-8 py-6 rounded-full text-base">
              Start your brand
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Reviews;
