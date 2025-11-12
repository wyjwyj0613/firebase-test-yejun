// src/components/InputField.js

import React from 'react';

const InputField = ({ label, type, value, onChange, placeholder, required = false, style }) => {
  return (
    <div style={{ margin: '15px 0' }}>
      {label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ 
          width: '100%', 
          padding: '12px 10px', 
          boxSizing: 'border-box', 
          border: '1px solid #ccc',
          borderRadius: '6px',
          fontSize: '1em',
          ...style
        }}
      />
    </div>
  );
};

export default InputField;