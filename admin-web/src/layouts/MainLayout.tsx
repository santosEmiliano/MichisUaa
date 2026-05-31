import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Icons from "../components/Icons";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="h-screen flex overflow-hidden bg-main text-main">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col lg:ml-72 min-w-0 transition-all duration-300 animate-content-entrance [animation-delay:150ms]">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto flex flex-col">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-overlay"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default MainLayout;
