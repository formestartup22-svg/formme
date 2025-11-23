import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const HeroSection: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleExploreClick = () => {
    if (!user) {
      toast.error("Please sign up to explore the collection", {
        description: "Create an account to start designing your custom garments.",
        action: {
          label: "Sign up",
          onClick: () => navigate("/auth")
        }
      });
    } else {
      navigate("/new-design");
    }
  };

  const handleDesignClick = () => {
    if (!user) {
      toast.error("Please sign up to start designing", {
        description: "Create an account to access the design dashboard.",
        action: {
          label: "Sign up",
          onClick: () => navigate("/auth")
        }
      });
    } else {
      navigate("/dashboard");
    }
  };

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
        <button
          onClick={handleExploreClick}
          className="w-[219px] h-[72px] flex-shrink-0 text-white text-base font-medium 
                     rounded-[30px] relative overflow-hidden max-sm:w-full max-sm:p-5 
                     bg-[#344C3D] shadow-[3px_7px_5px_0px_rgba(0,0,0,0.25)]
                     hover:opacity-90 transition-opacity"
        >
          {/* Gold image overlay with blend mode */}
          <div className="absolute inset-0 bg-[url('/imageButtons.png')] bg-cover bg-center mix-blend-multiply"></div>

          {/* Text content on top */}
          <span className="relative z-10">Explore Collection</span>
        </button>

        <button
          onClick={handleDesignClick}
          className="w-[219px] h-[72px] flex-shrink-0 text-white text-base font-medium 
                     rounded-[30px] relative overflow-hidden max-sm:w-full max-sm:p-5 
                     bg-[#974320] shadow-[3px_7px_5px_0px_rgba(0,0,0,0.25)]
                     hover:opacity-90 transition-opacity"
        >
          {/* Gold image overlay with blend mode */}
          <div className="absolute inset-0 bg-[url('/imageButtons.png')] bg-cover bg-center mix-blend-multiply"></div>

          {/* Text content on top */}
          <span className="relative z-10">Start Designing</span>
        </button>
    </div>
    </section>
  );
};

export default HeroSection;
