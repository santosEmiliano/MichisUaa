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

      <div className="flex-1 flex flex-col md:ml-72 min-w-0 transition-all duration-300 animate-content-entrance [animation-delay:150ms]">
        <Header />
        <main className="flex-1 p-6 md:p-10 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>

      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg md:hidden bg-orange"
      >
        <Icons.Menu className="w-8 h-8 text-white" />
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-overlay"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default MainLayout;
