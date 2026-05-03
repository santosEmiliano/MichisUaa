import { useState } from "react";
import { ModalCrud } from "./ModalCrud";
import Icons from "./Icons";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsuarioModal = ({ isOpen, onClose }: UserModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"Administrador" | "Simpatizante">(
    "Administrador",
  );

  const footer = (
    <div className="flex gap-4 w-full justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl border border-sidebar-separador text-main font-bold bg-gris hover:bg-gris-oscuro hover:border-acento-naranja focus:border-acento-naranja focus:bg-[var(--bg-active-item)] transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-6 py-2.5 rounded-xl border border-[#e8893c] bg-[var(--bg-active-item)] text-[#e8893c] font-bold hover:bg-[rgba(232,137,60,0.30)] hover:border-acento-naranja transition-all duration-200"
      >
        Crear usuario
      </button>
    </div>
  );

  return (
    <ModalCrud
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Usuario"
      footer={footer}
    >
      <form className="space-y-6">
        <div>
          <label className="block text-main font-bold mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            placeholder="Ej. Julián Emmanuel"
            className="w-full bg-gris border border-sidebar-separador rounded-xl px-4 py-3.5 text-main focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 placeholder-secondary"
          />
        </div>

        <div>
          <label className="block text-main font-bold mb-2">
            Email Institucional
          </label>
          <input
            type="email"
            placeholder="usuario@edu.uaa.mx"
            className="w-full bg-gris border border-sidebar-separador rounded-xl px-4 py-3.5 text-main focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 placeholder-secondary"
          />
        </div>

        <div>
          <label className="block text-main font-bold mb-2">
            Contraseña temporal
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="*****************"
              className="w-full bg-gris border border-sidebar-separador rounded-xl px-4 py-3.5 pr-12 text-main focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 placeholder-secondary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-secondary hover:text-main transition-colors"
            >
              {showPassword ? (
                <Icons.EyeOff className="w-5 h-5" />
              ) : (
                <Icons.Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

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
                  {r === "Administrador"
                    ? "Acceso completo"
                    : "Solo avistamientos"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="block text-main font-bold">
            Colonias Asignadas
          </label>
          <div className="relative w-56">
            <select
              className="appearance-none w-full bg-gris border border-sidebar-separador text-secondary rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 cursor-pointer [&>option]:bg-[#30302e] [&>option]:text-white"
              style={{ colorScheme: "dark" }}
            >
              <option>Seleccionar colonias</option>
              <option>Colonia Central</option>
              <option>Ed. 108</option>
              <option>UMD</option>
            </select>
            <Icons.ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-secondary pointer-events-none" />
          </div>
        </div>
      </form>
    </ModalCrud>
  );
};
