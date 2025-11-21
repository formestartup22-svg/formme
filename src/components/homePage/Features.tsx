
import * as React from "react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { 
  ArrowRight, 
  Brush, 
  Factory, 
  Star,
  Shield,
  Clock,
  Award,
  Users,
  Truck,
  Recycle
} from "lucide-react";
import KeywordMarquee from "./KeywordMarquee";

export default function Features() {
  const featuresRef = useRef<HTMLDivElement>(null);
  
  return (
    <section 
      ref={featuresRef} 
      className="py-24 relative overflow-hidden font-inter bg-[#344C3D]"
    >
      
      
      
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24 text-center"
        >
          <span className="inline-block text-sm font-semibold tracking-wider text-[#FFF7DE] uppercase mb-6 bg-gradient-to-r from-white/20 via-white/10 to-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-gradient-to-r from-white/30 to-white/10">
            A Professional Approach
          </span>
          
          <h2 className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-8 bg-gradient-to-r from-white via-[#FFF7DE] to-white bg-clip-text text-transparent">
            Designed for <span className="bg-gradient-to-r from-[#FFF7DE] via-[#f5efd3] to-[#e8dc9f] bg-clip-text text-transparent font-medium">excellence</span>
          </h2>
          
          <p className="text-xl text-[#FFF7DE]/80 max-w-3xl mx-auto font-light leading-relaxed">
            Our professional tools are crafted to deliver exceptional results, combining industry expertise with cutting-edge technology.
          </p>
        </motion.div>

        {/* Thin keyword marquee */}
        <div className="mb-20">
          <KeywordMarquee speedMs={22000} />
        </div>

        {/* Clean 3-step overview */}
        <motion.ol
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <li className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-sm font-medium">01</div>
            <h4 className="mt-4 text-xl font-medium text-white">Design</h4>
            <p className="mt-1 text-sm text-white/70">Sketch, import, or start from templates.</p>
          </li>
          <li className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-sm font-medium">02</div>
            <h4 className="mt-4 text-xl font-medium text-white">Preview</h4>
            <p className="mt-1 text-sm text-white/70">See it live with instant 3D visualization.</p>
          </li>
          <li className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-sm font-medium">03</div>
            <h4 className="mt-4 text-xl font-medium text-white">Deliver</h4>
            <p className="mt-1 text-sm text-white/70">Checkout securely and track your order.</p>
          </li>
        </motion.ol>

        {/* CTA */}
        <div className="text-center">
          <Button className="rounded-xl px-8 py-6 bg-primary text-primary-foreground hover:opacity-90 transition">
            Start Designing
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// Feature Card Component
const FeatureCard = ({ index, feature }: { index: number; feature: FeatureType }) => {
  const delay = 0.2 + index * 0.2;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md p-10 rounded-2xl border border-gradient-to-br from-white/30 to-white/10 hover:bg-gradient-to-br hover:from-white/20 hover:via-white/15 hover:to-white/10 transition-all duration-300"
    >
      {/* Feature number */}
      <div className="mb-8">
        <span className="inline-block text-5xl font-light bg-gradient-to-br from-[#FFF7DE] to-[#e8dc9f] bg-clip-text text-transparent mb-6">
          {feature.number}
        </span>
        
        {/* Feature icon */}
        <div className={cn(
          "flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-gradient-to-br from-[#FFF7DE]/30 via-[#FFF7DE]/20 to-transparent"
        )}>
          <feature.icon className="w-8 h-8 text-[#FFF7DE]" />
        </div>
      </div>
      
      {/* Feature title */}
      <h3 className="text-2xl font-medium mb-6 text-white">
        {feature.title}
      </h3>
      
      {/* Decorative line */}
      <div className="w-16 h-px bg-gradient-to-r from-[#FFF7DE] to-transparent mb-6"></div>
      
      {/* Feature description */}
      <p className="text-white/80 leading-relaxed font-light mb-8 text-lg">
        {feature.description}
      </p>
      
      {/* Learn more link */}
      <div className="flex items-center text-[#FFF7DE] hover:text-white transition-colors duration-300 cursor-pointer group">
        <div className="w-10 h-px bg-gradient-to-r from-current to-transparent mr-4 group-hover:from-white group-hover:to-transparent"></div>
        <span className="text-base font-medium">Learn more</span>
      </div>
    </motion.div>
  );
};

// Types
interface FeatureType {
  number: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  bgColor: string;
  iconColor: string;
}

interface BenefitType {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}

// Feature data
const features: FeatureType[] = [
  {
    number: "01",
    title: "Creative Design Tools",
    description: "Leverage our sophisticated design interface built for professional workflows, with precision controls and enterprise-grade capabilities.",
    icon: Brush,
    bgColor: "bg-[#FFF7DE]/20",
    iconColor: "text-[#FFF7DE]"
  },
  {
    number: "02",
    title: "Ethical Manufacturing",
    description: "Access on-demand manufacturing that prioritizes ethical practices and sustainability for professional fashion production.",
    icon: Factory,
    bgColor: "bg-[#FFF7DE]/20",
    iconColor: "text-[#FFF7DE]"
  },
  {
    number: "03",
    title: "Premium Quality",
    description: "Experience exceptional quality with every garment through our rigorous standards and premium materials selection process.",
    icon: Star,
    bgColor: "bg-[#FFF7DE]/20",
    iconColor: "text-[#FFF7DE]"
  }
];

// Benefits data
const benefits: BenefitType[] = [
  {
    icon: Shield,
    title: "Secure & Protected",
    description: "Enterprise-grade security with full IP protection and confidential design handling."
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Rapid prototyping and production with industry-leading delivery times."
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description: "Rigorous quality control at every step ensures premium results every time."
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Dedicated design consultants and production specialists at your service."
  },
  {
    icon: Truck,
    title: "Global Shipping",
    description: "Worldwide delivery with tracking and insurance for complete peace of mind."
  },
  {
    icon: Recycle,
    title: "Sustainable Practices",
    description: "Eco-friendly materials and processes that align with your sustainability goals."
  }
];

