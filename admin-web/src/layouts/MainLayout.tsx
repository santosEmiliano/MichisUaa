import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Icons from "../components/Icons";
import { checkSession } from "../utils/auth";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const navigate = useNavigate();

  useEffect(() => {
    // Chequeo periódico (cada minuto) para asegurar que el token no haya expirado
    const interval = setInterval(() => {
      if (!checkSession()) {
        navigate("/login");
      }
    }, 60000);

    // Chequeo por si el usuario borra los datos en otra pestaña o los altera
    const handleStorageChange = () => {
      if (!checkSession()) {
        navigate("/login");
      }
    };
    
    // Verificación inmediata al montar
    if (!checkSession()) {
      navigate("/login");
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return (
    <div className="h-screen flex overflow-hidden bg-main text-main">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col md:ml-72 min-w-0 transition-all duration-300">
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
