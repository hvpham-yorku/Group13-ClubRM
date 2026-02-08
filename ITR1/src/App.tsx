import React from 'react';

export default function App() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      backgroundColor: '#0a0a0a',
      color: 'white'
    }}>
      <img src="/logo.webp" alt="Logo" style={{ height: '80px', marginBottom: '20px' }} />
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>ClubRM</h1>
      <p style={{ color: '#888' }}>Iteration 1: Project Foundation</p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        border: '1px solid #333', 
        borderRadius: '12px',
        backgroundColor: '#111'
      }}>
        <h2 style={{ color: '#10b981' }}>Build Successful! ✅</h2>
        <p style={{ fontSize: '0.875rem', color: '#888' }}>
          Vite is correctly serving this project foundation.
        </p>
      </div>
    </div>
  );
}
