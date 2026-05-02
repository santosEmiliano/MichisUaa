import { useState } from "react";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Icons from "./components/Icons";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex overflow-hidden bg-main text-main">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <h2 className="text-3xl font-bold text-main">
            ¡El cascarón funciona! l
          </h2>
          <p className="text-xl text-secondary mt-2">
            El Sidebar y el Header ya están conectados. Aquí es donde
            agregaremos el Dashboard en el siguiente paso.
          </p>
        </main>
      </div>

      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg md:hidden bg-orange transition-transform"
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
}

export default App;
