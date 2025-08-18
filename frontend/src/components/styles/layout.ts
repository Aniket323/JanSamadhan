import React from 'react';

export const pageContainer: React.CSSProperties = {
  width: '100%',
  minHeight: '100vh',
  background: '#f5f5f5',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden'
};

export const headerStyle: React.CSSProperties = {
  width: '100%',
  height: '80px',
  background: 'white',
  display: 'flex',
  alignItems: 'center',
  padding: '0 40px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  boxSizing: 'border-box'
};

export const mainContentStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 20px',
  boxSizing: 'border-box'
};

export const footerStyle: React.CSSProperties = {
  width: '100%',
  height: 60,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 60,
  background: 'white',
  position: 'fixed',
  bottom: 0,
  left: 0,
  boxShadow: '0px -2px 6px rgba(0,0,0,0.08)'
};