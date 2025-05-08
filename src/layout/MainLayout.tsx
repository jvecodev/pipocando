import React from 'react';
import Header from './Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </>
  );
};

export default MainLayout;
