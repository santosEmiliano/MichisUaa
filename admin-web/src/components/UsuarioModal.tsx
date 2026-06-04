import { useState, useEffect } from "react";
import { ModalCrud } from "./ModalCrud";
import Icons from "./Icons";
import { authService } from "../services/authApi";
import { userService } from "../services/userApi";
import { coloniesService } from "../services/coloniesApi";
import { alertService } from "../services/alertService";
import type { User, Colonia } from "../types/models";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSuccess?: () => void;
}

// ── Validaciones ──
interface FormErrors {
  nombre?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validateForm(
  nombre: string,
  email: string,
  password: string,
  confirmPassword: string,
  isEditing: boolean = false
): FormErrors {
  const errors: FormErrors = {};

  // Nombre
  if (!nombre.trim()) {
    errors.nombre = "El nombre es obligatorio.";
  } else if (nombre.trim().length < 3) {
    errors.nombre = "El nombre debe tener al menos 3 caracteres.";
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Ingresa un correo válido.";
  }

  // Contraseña
  if (!isEditing) {
    if (!password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      errors.password = "Mínimo 6 caracteres.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Debe contener al menos una mayúscula.";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Debe contener al menos un número.";
    }
  } else {
    if (password) {
      if (password.length < 6) {
        errors.password = "Mínimo 6 caracteres.";
      } else if (!/[A-Z]/.test(password)) {
        errors.password = "Debe contener al menos una mayúscula.";
      } else if (!/[0-9]/.test(password)) {
        errors.password = "Debe contener al menos un número.";
      }
    }
  }

  // Confirmación
  if (!isEditing || password) {
    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
  }

  return errors;
}

// ── Estetica para la contraseña ──

function getPasswordStrength(password: string): {
  label: string;
  color: string;
  width: string;
} {
  if (!password) return { label: "", color: "", width: "0%" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Muy débil", color: "#ef4444", width: "20%" };
  if (score === 2) return { label: "Débil", color: "#f97316", width: "40%" };
  if (score === 3) return { label: "Regular", color: "#eab308", width: "60%" };
  if (score === 4) return { label: "Buena", color: "#22c55e", width: "80%" };
  return { label: "Fuerte", color: "#16a34a", width: "100%" };
}

// ── Componente ──

export const UsuarioModal = ({ isOpen, onClose, userToEdit, onSuccess }: UserModalProps) => {
  const isEditing = !!userToEdit;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<"Administrador" | "Simpatizante">("Simpatizante");

  // Colonias seleccionadas (ids). Se enviarán al back cuando el endpoint esté listo.
  // TODO: conectar al createUser cuando el back soporte asignación de colonias en la creación.
  const [selectedColonias, setSelectedColonias] = useState<number[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    coloniesService.getColonies()
      .then(setColonias)
      .catch((error) => {
        console.error(error);
        alertService.error(
          "No pudimos cargar la lista de colonias. Intenta de nuevo más tarde.",
          "Error de Carga"
        );
      });
  }, [isOpen]);

  const toggleColonia = (id: number) => {
    setSelectedColonias((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Campos
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Errores por campo (se muestran después del primer intento de submit)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // UI general
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre);
      setEmail(userToEdit.email);
      setRole(userToEdit.rol);
      if (colonias.length > 0) {
        const coloniaIds = colonias
          .filter(c => userToEdit.coloniasAsignadas.includes(c.name))
          .map(c => c.id);
        setSelectedColonias(coloniaIds);
      }
    } else {
      resetForm();
    }
  }, [userToEdit, colonias]);

  // Revalida en tiempo real
  const handleChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: keyof FormErrors,
    value: string,
    extra?: { confirmValue?: string; passwordValue?: string }
  ) => {
    setter(value);
    if (submitted) {
      const current = {
        nombre: field === "nombre" ? value : nombre,
        email: field === "email" ? value : email,
        password: field === "password" ? value : password,
        confirmPassword:
          field === "confirmPassword"
            ? value
            : extra?.confirmValue ?? confirmPassword,
      };
      const errs = validateForm(
        current.nombre,
        current.email,
        current.password,
        current.confirmPassword,
        isEditing
      );
      setFieldErrors(errs);
    }
  };

  const resetForm = () => {
    setNombre("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("Simpatizante");
    setSelectedColonias([]);
    setFieldErrors({});
    setSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const errors = validateForm(nombre, email, password, confirmPassword, isEditing);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      alertService.warning("Por favor, verifica los campos del formulario.", "Información Incompleta");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && userToEdit) {
        const body: Record<string, unknown> = {
          nombre,
          email,
          admin: role === "Administrador",
        };
        if (password) body.password = password;
        if (selectedColonias.length > 0 && role === "Administrador") body.coloniasIds = selectedColonias;
        await userService.updateUser(userToEdit.id, body);
        alertService.success("El usuario ha sido actualizado correctamente.", "Usuario Actualizado");
      } else {
        const esAdmin = role === "Administrador";
        await authService.createUser(nombre, email, password, esAdmin);
        alertService.success("El usuario ha sido creado correctamente.", "Usuario Creado");
      }
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      alertService.error(
        "Ocurrió un problema al guardar la información del usuario. Verifica los datos e intenta de nuevo.",
        "Error al Guardar"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-gris border rounded-xl px-4 py-3.5 text-main focus:outline-none transition-all duration-200 placeholder-secondary ${
      fieldErrors[field]
        ? "border-red-500 focus:border-red-500"
        : "border-sidebar-separador focus:border-acento-naranja hover:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)]"
    }`;

  const footer = (
    <div className="flex gap-4 w-full justify-end">
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="px-6 py-2.5 rounded-xl border border-sidebar-separador text-main font-bold bg-gris hover:bg-gris-oscuro hover:border-acento-naranja transition-all duration-200 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="form-nuevo-usuario"
        disabled={loading}
        className="px-6 py-2.5 rounded-xl border border-[#e8893c] bg-[var(--bg-active-item)] text-[#e8893c] font-bold hover:bg-[rgba(232,137,60,0.30)] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {isEditing ? "Guardando..." : "Creando..."}
          </>
        ) : (
          isEditing ? "Guardar cambios" : "Crear usuario"
        )}
      </button>
    </div>
  );

  return (
    <ModalCrud
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
      footer={footer}
    >
      <form id="form-nuevo-usuario" onSubmit={handleSubmit} className="space-y-5" noValidate>

        {/* Nombre */}
        <div>
          <label className="block text-main font-bold mb-2">Nombre Completo</label>
          <input
            type="text"
            maxLength={90}
            value={nombre}
            onChange={(e) => handleChange(setNombre, "nombre", e.target.value)}
            placeholder="Ej. Julián Emmanuel"
            className={inputClass("nombre")}
          />
          <div className={`text-xs text-right mt-1 ${nombre.length >= 90 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
            {nombre.length} / 90
          </div>
          {fieldErrors.nombre && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.nombre}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-main font-bold mb-2">Email Institucional</label>
          <input
            type="email"
            maxLength={80}
            value={email}
            onChange={(e) => handleChange(setEmail, "email", e.target.value)}
            placeholder="usuario@edu.uaa.mx"
            className={inputClass("email")}
          />
          <div className={`text-xs text-right mt-1 ${email.length >= 80 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
            {email.length} / 80
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-main font-bold mb-2">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              maxLength={150}
              value={password}
              onChange={(e) => handleChange(setPassword, "password", e.target.value)}
              placeholder="••••••••"
              className={`${inputClass("password")} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-secondary hover:text-main transition-colors"
            >
              {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className={`text-xs text-right mt-1 ${password.length >= 150 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
            {password.length} / 150
          </div>
          {/* Indicador de fortaleza */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full bg-gris rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: strength.width, backgroundColor: strength.color }}
                />
              </div>
              <p className="text-xs" style={{ color: strength.color }}>
                {strength.label}
              </p>
            </div>
          )}
          {fieldErrors.password && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-main font-bold mb-2">Confirmar Contraseña</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              maxLength={150}
              value={confirmPassword}
              onChange={(e) =>
                handleChange(setConfirmPassword, "confirmPassword", e.target.value)
              }
              placeholder="••••••••"
              className={`${inputClass("confirmPassword")} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-4 text-secondary hover:text-main transition-colors"
            >
              {showConfirm ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className={`text-xs text-right mt-1 ${confirmPassword.length >= 150 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
            {confirmPassword.length} / 150
          </div>
          {/* Icono de coincidencia */}
          {confirmPassword && password && confirmPassword === password && (
            <p className="text-xs text-green-400 mt-1.5">✓ Las contraseñas coinciden</p>
          )}
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-main font-bold mb-2">Rol</label>
          <div className="grid grid-cols-2 gap-4">
            {(["Administrador", "Simpatizante"] as const).map((r) => (
              <div
                key={r}
                onClick={() => setRole(r)}
                className={`cursor-pointer rounded-xl border p-4 text-center transition-all duration-200 ${
                  role === r
                    ? "border-[#e8893c] bg-[rgba(232,137,60,0.18)]"
                    : "border-sidebar-separador bg-gris hover:border-[#e8893c] hover:bg-[rgba(232,137,60,0.18)]"
                }`}
              >
                <div className="font-bold text-base text-main">{r}</div>
                <div className="text-sm text-secondary mt-0.5">
                  {r === "Administrador" ? "Acceso completo" : "Solo avistamientos"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {role === "Administrador" && (
          <div className="pt-1">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-main font-bold">Colonias Asignadas</label>
              {selectedColonias.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[rgba(232,137,60,0.18)] text-[#e8893c] border border-[#e8893c]">
                  {selectedColonias.length} seleccionada{selectedColonias.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {colonias.map((colonia) => {
                const checked = selectedColonias.includes(colonia.id);
                return (
                  <div
                    key={colonia.id}
                    onClick={() => toggleColonia(colonia.id)}
                    className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-all duration-200 ${
                      checked
                        ? "border-[#e8893c] bg-[rgba(232,137,60,0.10)]"
                        : "border-sidebar-separador bg-gris hover:border-[#e8893c] hover:bg-[rgba(232,137,60,0.05)]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all duration-200 ${
                        checked
                          ? "bg-[#e8893c] border-[#e8893c]"
                          : "border-sidebar-separador bg-transparent"
                      }`}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-main truncate">{colonia.name}</p>
                      <p className="text-xs text-secondary">{colonia.location}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </ModalCrud>
  );
};
