import { useState } from "react";
import Icons from "../components/Icons";
import { authService } from "../services/authApi";

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
  const [apiError, setApiError] = useState<string | null>(null);
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
    setApiError(null);

    const errors = validateLogin(email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.datos.idUsuario));
      localStorage.setItem("userName", data.datos.nombre);
      localStorage.setItem("isAdmin", String(data.datos.admin));
      onLogin();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl px-4 py-3 text-main focus:outline-none transition-all duration-200 placeholder-secondary";
  const inputOk = `${inputBase} input-field border-sidebar-separador`;
  const inputErr = `${inputBase} bg-gris border border-red-500 focus:border-red-500`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-main p-4">
      <div className="relative w-full max-w-md bg-panel rounded-2xl border border-panel overflow-hidden">
        {/* Línea decorativa superior */}
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

        {/* Formulario */}
        <div className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sidebar-secciones text-xs font-bold mb-2 uppercase tracking-widest">
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
              <label className="block text-sidebar-secciones text-xs font-bold mb-2 uppercase tracking-widest">
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

            {/* Error del API (credenciales incorrectas, etc.) */}
            {apiError && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange text-white font-bold rounded-xl px-4 py-3.5 mt-1 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
