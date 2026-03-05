import React, { createContext, useState, useEffect } from 'react';

export const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  // লোকাল স্টোরেজ থেকে মুড লোড করা (ডিফল্ট: campus)
  const [mode, setMode] = useState(localStorage.getItem('viewMode') || 'campus');

  const toggleMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('viewMode', newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};