import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen bg-[#D4C4B0]">
      <NavBar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-40 pb-20">
        <div className="max-w-4xl">
          <h1 className="text-[120px] lg:text-[160px] font-bold text-[#1a1a1a] leading-none mb-4">
            formme
          </h1>
          <p className="text-2xl lg:text-3xl text-[#1a1a1a] mb-12">
            redefining self-expression & sustainability.
          </p>
          <div className="flex gap-4">
            <Link to="/marketplace">
              <Button 
                className="bg-[#344C3D] hover:bg-[#2a3d31] text-white px-8 py-6 rounded-full text-base"
              >
                Explore Collection
              </Button>
            </Link>
            <Link to="/designer">
              <Button 
                className="bg-[#A0654B] hover:bg-[#8b5740] text-white px-8 py-6 rounded-full text-base"
              >
                Start Designing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="bg-black py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Crafted with care
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Every piece tells a story of ethical manufacturing, sustainable practices, and authentic self-expression.
              </p>
              <p className="text-gray-400">
                We partner with trusted factories to bring your designs to life while maintaining the highest standards of quality and responsibility.
              </p>
            </div>
            <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Craftsmanship imagery
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
