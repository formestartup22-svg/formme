import React, { useState, useEffect } from 'react';
import { Star, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Reviews = () => {
  // Sample review data
  const reviews = [
    {
      id: 1,
      name: "Emma Johnson",
      rating: 5,
      review: "Absolutely love this platform! They always have the latest design tools and sustainable options.",
      verified: true,
      avatar: "E",
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 5,
      review: "The quality of the garments is excellent, and the design interface is very intuitive!",
      verified: true,
      avatar: "M",
    },
    {
      id: 3,
      name: "Sophia Rodriguez",
      rating: 5,
      review: "Highly recommend this platform to anyone looking for stylish, well-made fashion with sustainable practices!",
      verified: true,
      avatar: "S",
    },
    {
      id: 4,
      name: "Lucas Wong",
      rating: 4,
      review: "Outstanding quality and service. The customization tools are exactly what I needed for my designs.",
      verified: true,
      avatar: "L",
    },
    {
      id: 5,
      name: "Aisha Patel",
      rating: 5,
      review: "The organic materials are luxurious, and the design platform is so easy to use. Exceptional!",
      verified: true,
      avatar: "A",
    },
    {
      id: 6,
      name: "Daniel Kim",
      rating: 4,
      review: "The platform made it so easy to bring my fashion ideas to life. Looking forward to more fabric options.",
      verified: true,
      avatar: "D",
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // Filter reviews based on search query
  const filteredReviews = reviews.filter(review => {
    return searchQuery === "" || 
      review.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-rotate through reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReviewIndex((prevIndex) => 
        prevIndex === filteredReviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [filteredReviews.length]);

  // Render stars based on rating
  const renderRating = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4", 
          i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
        )}
      />
    ));
  };

  // Animation variants for the review bubbles
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white pt-[120px] pb-20">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/public/patterns/.gitkeep')] opacity-5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header section */}
        <div className="text-center mb-16">
          <h1 className="font-instrument text-4xl md:text-6xl font-light mb-6 text-white">
            formme <span className="text-[#ffc107] font-semibold">Customer Reviews</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            See what our fashion community is saying about their experience with our design platform.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-md">
            <Input
              placeholder="Search reviews..."
              className="pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-white h-12 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Review stats */}
        <div className="mb-12 text-center">
          <div className="inline-block bg-gradient-to-r from-[#333] to-[#222] p-6 rounded-xl">
            <h2 className="text-5xl font-bold text-white mb-4">4.9/5</h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-gray-300">Based on 234 verified reviews</p>
          </div>
        </div>
        
        {/* iPhone-style mockup with reviews - increased size */}
        <div className="flex justify-center mb-20">
          <div className="relative">
            {/* Phone frame - increased size */}
            <div className="relative mx-auto h-[700px] w-[350px] bg-[#1a1a1a] rounded-[40px] border-[16px] border-[#333] shadow-2xl overflow-hidden">
              {/* Phone display content */}
              <div className="relative h-full w-full bg-gradient-to-b from-[#222] to-[#111] rounded-[28px] overflow-hidden p-5">
                {/* Phone notch - adjusted for larger phone */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[140px] h-[28px] bg-[#1a1a1a] rounded-b-[16px] z-10"></div>
                
                {/* App header */}
                <div className="mt-10 mb-8 text-center">
                  <h3 className="font-medium text-2xl text-white">formme</h3>
                  <p className="text-sm text-gray-400">Sustainable Fashion Design</p>
                </div>
                
                {/* Animated review bubbles */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6 mt-6"
                >
                  {filteredReviews.slice(0, 3).map((review, index) => (
                    <motion.div
                      key={review.id}
                      variants={itemVariants}
                      className={cn(
                        "bg-gradient-to-r p-5 rounded-2xl shadow-lg transition-all duration-300",
                        index === activeReviewIndex % 3 
                          ? "from-[#3b5d4c] to-[#2c4a3c] scale-100 opacity-100" 
                          : "from-[#333] to-[#222] scale-95 opacity-70"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#f4e9e2] text-[#1a1a1a] flex items-center justify-center font-medium text-base">
                            {review.avatar}
                          </div>
                          <span className="font-medium text-white text-base">{review.name}</span>
                        </div>
                        <div className="flex">{renderRating(review.rating)}</div>
                      </div>
                      <p className="text-base text-gray-200">{review.review}</p>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* App navigation dots */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-3 h-3 rounded-full",
                        i === activeReviewIndex % 3 ? "bg-white" : "bg-gray-600"
                      )}
                      onClick={() => setActiveReviewIndex(i)}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Website URL at bottom */}
            <div className="text-center mt-6">
              <p className="text-[#ffc107] font-light text-sm">www.formme.com</p>
            </div>
          </div>
        </div>
        
        {/* Full review list */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-instrument font-light mb-8 text-center">All Customer Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] p-6 rounded-xl hover:from-[#3b5d4c] hover:to-[#2c4a3c] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#f4e9e2] text-[#1a1a1a] flex items-center justify-center font-medium mr-3">
                      {review.avatar}
                    </div>
                    <h3 className="font-medium text-lg">{review.name}</h3>
                  </div>
                  <div className="flex">{renderRating(review.rating)}</div>
                </div>
                <p className="text-gray-300">{review.review}</p>
                {review.verified && (
                  <div className="mt-3 flex items-center">
                    <span className="bg-[#3a3a3a] text-amber-400 text-xs px-3 py-1.5 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Verified Purchase
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Write a review CTA */}
        <div className="mt-20 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#3b5d4c] to-[#2c4a3c]">
          <div className="px-8 py-12 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-instrument font-light text-white mb-4">Share your experience</h2>
              <p className="text-gray-200 max-w-md">Help other designers by sharing your formme journey. Your feedback shapes our community.</p>
            </div>
            
            <Button 
              className="bg-white text-[#2c4a3c] hover:bg-gray-100 rounded-full px-8 py-6 h-auto font-medium"
            >
              <span>Write a Review</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
