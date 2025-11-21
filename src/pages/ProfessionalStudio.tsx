import React from 'react';
import Navbar from '@/components/Navbar';
import VectorStudio from '@/components/studio/VectorStudio';

const ProfessionalStudio: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-20 h-[calc(100vh-80px)]">
        <VectorStudio className="w-full h-full" />
      </div>
    </div>
  );
};

export default ProfessionalStudio;
