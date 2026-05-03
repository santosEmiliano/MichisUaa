import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Gatos from "./pages/Gatos";
import Usuarios from "./pages/Usuarios";
import Colonias from "./pages/Colonias";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Routes>
      {/*Ruta pública */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <AuthPage onLogin={() => setIsAuthenticated(true)} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
      >
        {/* lo manda al dashboard*/}
        <Route index element={<Dashboard />} />
        {/* rutas del panel, FALTAN AGREGAR LAS PÁGINAS, aqui agregamos las rutas */}
        <Route path="gatos" element={<Gatos />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="colonias" element={<Colonias />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
