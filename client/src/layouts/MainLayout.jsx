import React from 'react';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-100 min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
