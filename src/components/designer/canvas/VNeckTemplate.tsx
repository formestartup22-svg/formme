
import React from 'react';
import VNeckSVG from '../../../assets/vneck.svg';

const VNeckTemplate = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
      <img src={VNeckSVG} alt="V-neck template" style={{ width: 200, height: 200 }} />
    </div>
  );
};

export default VNeckTemplate;
