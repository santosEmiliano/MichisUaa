import { useState } from "react";
import Icons from "../components/Icons";

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main p-4">
      <div className="relative w-full max-w-md bg-panel rounded-2xl border border-panel overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--accent-orange), var(--accent-gold), transparent)",
          }}
        />

        {/* Logo */}
        <div className="text-center pt-10 pb-5 px-8">
          <div className="w-14 h-14 bg-orange rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-panel">
            <Icons.Paw className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-main">MichisUAA</h2>
          <p className="text-secondary text-sm mt-1">Panel de administración</p>
        </div>

        <div className="flex mx-8 border-b border-panel">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
              isLogin
                ? "text-acento-naranja border-[var(--accent-orange)]"
                : "text-secondary border-transparent hover-bg-item"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
              !isLogin
                ? "text-acento-naranja border-[var(--accent-orange)]"
                : "text-secondary border-transparent hover-bg-item"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex w-[200%] transition-transform duration-500 ease-in-out"
            style={{
              transform: isLogin ? "translateX(0)" : "translateX(-50%)",
            }}
          >
            <div className="w-1/2 p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sidebar-secciones text-xs font-bold mb-2 uppercase tracking-widest">
                    Correo
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="usuario@edu.uaa.mx"
                  />
                </div>
                <div>
                  <label className="block text-sidebar-secciones text-xs font-bold mb-2 uppercase tracking-widest">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                  />
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      className="text-xs text-acento-naranja hover:underline"
                    >
                      {/*Ni perra idea de si vamos a agregar un olvidaste tu constraseña, pero supongo q si */}
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange text-white font-bold rounded-xl px-4 py-3.5 mt-2 hover:opacity-90 transition-opacity"
                >
                  Entrar
                </button>
              </form>
              <p className="text-center text-sidebar-secundario text-sm mt-6">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-acento-naranja font-bold hover:underline"
                >
                  Regístrate
                </button>
              </p>
            </div>

            <div className="w-1/2 p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sidebar-secciones text-xs font-bold mb-2 uppercase tracking-widest">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Ej. Antonio Herrera Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sidebar-secciones text-xs font-bold mb-2 uppercase tracking-widest">
                    Correo institucional
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="usuario@edu.uaa.mx"
                  />
                </div>
                <div>
                  <label className="block text-sidebar-secciones text-xs font-bold mb-2 uppercase tracking-widest">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange text-white font-bold rounded-xl px-4 py-3.5 mt-2 hover:opacity-90 transition-opacity"
                >
                  Crear cuenta
                </button>
              </form>
              <p className="text-center text-sidebar-secundario text-sm mt-6">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-acento-naranja font-bold hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
