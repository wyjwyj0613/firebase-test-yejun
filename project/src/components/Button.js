// src/components/Button.js

import React from 'react';

const Button = ({ children, onClick, type = 'button', style, primary = false, disabled = false }) => {
  const baseStyle = {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    opacity: disabled ? 0.6 : 1, 
    ...style
  };

  const primaryStyle = {
    backgroundColor: '#6A0DAD', // OneQ 메인 컬러 (보라색)
    color: 'white',
  };
  
  const secondaryStyle = {
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ccc'
  };

  const finalStyle = primary ? { ...baseStyle, ...primaryStyle } : { ...baseStyle, ...secondaryStyle };

  return (
    <button type={type} onClick={onClick} style={finalStyle} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;