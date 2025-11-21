
import * as React from "react";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <section className="h-screen pt-52 pl-24 max-md:px-10 max-sm:px-5 max-sm:pt-32">
    <h1
    className="text-[128px] font-instrument font-bold leading-none text-transparent 
    bg-gradient-to-r from-[#09100B] via-[#4A6A5C] to-[#09100B] 
    bg-[length:300%_100%] bg-clip-text animate-shimmer"
    style={{ textShadow: '0px 4px 4px rgba(0, 0, 0, 0.4)' }}
    >
        formme
    </h1>

      <p className="mb-10 text-3xl text-black max-sm:text-2xl">
        redefining self-expression &amp; sustainability.
      </p>

      <div className="flex gap-6 max-md:flex-col max-md:max-w-[300px] max-sm:w-full">
      <Link to="/marketplace">
        <button
          className="w-[219px] h-[72px] flex-shrink-0 text-white text-base font-medium 
                     rounded-[30px] relative overflow-hidden max-sm:w-full max-sm:p-5 
                     bg-[#344C3D] shadow-[3px_7px_5px_0px_rgba(0,0,0,0.25)]"
        >
          {/* Gold image overlay with blend mode */}
          <div className="absolute inset-0 bg-[url('/imageButtons.png')] bg-cover bg-center mix-blend-multiply"></div>

          {/* Text content on top */}
          <span className="relative z-10">Explore Collection</span>
        </button>
      </Link>

<Link to="/studio-selection">
<button
  className="w-[219px] h-[72px] flex-shrink-0 text-white text-base font-medium 
             rounded-[30px] relative overflow-hidden max-sm:w-full max-sm:p-5 
             bg-[#974320] shadow-[3px_7px_5px_0px_rgba(0,0,0,0.25)]"
>
  {/* Gold image overlay with blend mode */}
  <div className="absolute inset-0 bg-[url('/imageButtons.png')] bg-cover bg-center mix-blend-multiply"></div>

  {/* Text content on top */}
  <span className="relative z-10">Start Designing</span>
    </button>
</Link>
    </div>
    </section>
  );
};

export default HeroSection;
