import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      background: 'rgba(255, 255, 255, 0.1)', 
      borderRadius: '10px',
      color: 'white',
      textAlign: 'center'
    }}>
      <h2>Test Component</h2>
      <p>If you can see this, React is working!</p>
    </div>
  );
};
