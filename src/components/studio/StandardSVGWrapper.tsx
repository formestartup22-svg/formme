
import React from 'react';

interface StandardSVGWrapperProps {
  children: React.ReactNode;
  className?: string;
  viewBox?: string;
  preserveAspectRatio?: string;
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  style?: React.CSSProperties;
}

const StandardSVGWrapper = ({
  children,
  className = "w-full max-w-[300px] h-auto",
  viewBox = "0 0 512 512",
  preserveAspectRatio = "xMidYMid meet",
  onClick,
  style
}: StandardSVGWrapperProps) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
        className={className}
        onClick={onClick}
        style={{
          width: '100%',
          height: 'auto',
          ...style
        }}
      >
        {children}
      </svg>
    </div>
  );
};

export default StandardSVGWrapper;
