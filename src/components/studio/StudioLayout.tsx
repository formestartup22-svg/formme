
import React from 'react';
import { useLocation } from 'react-router-dom';
import ProStudioLayout from './ProStudioLayout';

const StudioLayout = () => {
  const location = useLocation();
  
  // For now, we'll assume Creative Studio is the default (free tier)
  // In a real app, this would be determined by user subscription status
  const isProfessional = false; // This would be determined by user's subscription
  
  return <ProStudioLayout isProfessional={isProfessional} />;
};

export default StudioLayout;
