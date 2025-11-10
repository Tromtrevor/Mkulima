import React from "react";
import SidebarMenu from "./components/SidebarMenu";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64">
        <SidebarMenu />
      </div>
      <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
