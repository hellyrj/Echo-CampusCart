import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-md',
  rounded = 'rounded-lg',
  bg = 'bg-white'
}) => {
  const cardClasses = `${bg} ${shadow} ${rounded} ${padding} ${className}`;

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;
