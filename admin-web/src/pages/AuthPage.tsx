import Icons from "../components/Icons";
import LoginBackground from "../components/LoginBackground";
import { useState } from "react";
import { authService } from "../services/authApi";
import { alertService } from "../services/alertService";

interface AuthPageProps {
  onLogin: () => void;
}

// ── Validación del login ─────────────────────────────────────

interface LoginErrors {
  email?: string;
  password?: string;
}

function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  }

  return errors;
}

// ── Componente ───────────────────────────────────────────────

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Revalida en tiempo real después del primer submit
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (submitted) {
      const errs = validateLogin(value, password);
      setFieldErrors(errs);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (submitted) {
      const errs = validateLogin(email, value);
      setFieldErrors(errs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const errors = validateLogin(email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const data = await authService.login(email, password);

      // Verificar que el usuario sea administrador
      if (!data.datos.admin) {
        alertService.error(
          "No tienes permisos para acceder al panel de administración.",
          "Acceso Denegado"
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.datos.id));
      localStorage.setItem("userName", data.datos.nombre);
      localStorage.setItem("isAdmin", String(data.datos.admin));
      
      alertService.success("Has iniciado sesión correctamente.", "¡Bienvenido!");
      onLogin();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hubo un problema al iniciar sesión.";
      
      if (msg.toLowerCase().includes("correo")) {
        setFieldErrors({ ...errors, email: msg });
      } else if (msg.toLowerCase().includes("contraseña") || msg.toLowerCase().includes("credenciales")) {
        setFieldErrors({ ...errors, password: msg });
      } else {
        alertService.error(msg, "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl px-4 py-3 text-main focus:outline-none transition-all duration-200 placeholder:text-secondary";
  const inputOk = `${inputBase} bg-[var(--fondo-gris)] border-[var(--border-color)] focus:bg-[var(--bg-hover)] focus:border-[var(--accent-orange)]`;
  const inputErr = `${inputBase} bg-red-500/10 border border-red-500/50 focus:border-red-500`;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <LoginBackground />
      
      <div className="relative w-full max-w-md backdrop-blur-xl bg-panel rounded-[2.5rem] border border-[var(--border-color)] shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] overflow-hidden z-10">

        {/* Línea decorativa superior */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--accent-orange), var(--accent-gold), transparent)",
          }}
        />

        {/* Logo */}
        <div className="text-center pt-12 pb-6 px-8">
          <div className="mx-auto mb-5">
            <img 
              src={`${import.meta.env.BASE_URL}MichisUAALogo.png`} 
              alt="MichisUAA Logo" 
              className="w-20 h-20 object-contain mx-auto"
            />
          </div>
          <h2 className="text-3xl font-black text-main tracking-tight">MichisUAA</h2>
          <p className="text-secondary text-sm font-medium mt-1">Panel de administración</p>
        </div>

        {/* Formulario */}
        <div className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-secondary text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={fieldErrors.email ? inputErr : inputOk}
                placeholder="usuario@edu.uaa.mx"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-secondary text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`${fieldErrors.password ? inputErr : inputOk} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-secondary hover:text-main transition-colors"
                >
                  {showPassword ? (
                    <Icons.EyeOff className="w-5 h-5" />
                  ) : (
                    <Icons.Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.password}</p>
              )}
              <div className="text-right mt-1.5">
                <button
                  type="button"
                  className="text-xs text-acento-naranja hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>



            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e8893c] to-[#d8aa71] text-white font-bold rounded-xl px-4 py-4 mt-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
