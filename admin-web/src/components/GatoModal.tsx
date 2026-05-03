import { useState } from "react";
import { ModalCrud } from "./ModalCrud";
import Icons from "./Icons";

interface CatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GatoModal = ({ isOpen, onClose }: CatModalProps) => {
  const [esterilizado, setEsterilizado] = useState<boolean>(true);

  const footer = (
    <div className="flex gap-4 w-full justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-acento-naranja hover:bg-[rgba(232,137,60,0.18)] focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.18)] transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-6 py-2.5 rounded-xl border border-[#e8893c] bg-[var(--bg-active-item)] text-[#e8893c] font-bold hover:bg-[rgba(232,137,60,0.30)] hover:border-acento-naranja transition-all duration-200"
      >
        Registrar Gato
      </button>
    </div>
  );

  return (
    <ModalCrud
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Gato"
      footer={footer}
    >
      <form className="space-y-6">
        <div>
          <label className="block text-main font-bold mb-2">
            Nombre del Gato
          </label>
          <input
            type="text"
            placeholder="Ej. Manchas"
            className="w-full bg-gris border border-sidebar-separador rounded-xl px-4 py-3.5 text-main focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] transition-all duration-200 placeholder-secondary hover:border-acento-naranja"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="block text-main font-bold">Colonia</label>
          <div className="relative w-56">
            <select
              defaultValue=""
              className="appearance-none w-full bg-gris border border-sidebar-separador text-secondary rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 cursor-pointer [&>option]:bg-[#30302e] [&>option]:text-white"
              style={{ colorScheme: "dark" }}
            >
              <option value="" disabled>
                Seleccionar colonia
              </option>
              <option value="central">Colonia Central</option>
              <option value="ed108">Ed. 108</option>
              <option value="alberca">Zona alberca</option>
              <option value="umd">UMD</option>
            </select>
            <Icons.ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-secondary pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-main font-bold mb-2">
            ¿Está esterilizado?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setEsterilizado(true)}
              className={`cursor-pointer rounded-xl border p-4 text-center transition-all duration-200 ${
                esterilizado
                  ? "border-[#e8893c] bg-[rgba(232,137,60,0.18)]"
                  : "border-sidebar-separador bg-gris hover:border-[#e8893c] hover:bg-[rgba(232,137,60,0.18)]"
              }`}
            >
              <div className="font-bold text-base text-main">Sí</div>
            </div>
            <div
              onClick={() => setEsterilizado(false)}
              className={`cursor-pointer rounded-xl border p-4 text-center transition-all duration-200 ${
                !esterilizado
                  ? "border-[#e8893c] bg-[rgba(232,137,60,0.18)]"
                  : "border-sidebar-separador bg-gris hover:border-[#e8893c] hover:bg-[rgba(232,137,60,0.18)]"
              }`}
            >
              <div className="font-bold text-base text-main">No</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="block text-main font-bold">Estado</label>
          <div className="relative w-56">
            <select
              className="appearance-none w-full bg-gris border border-sidebar-separador text-secondary rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 cursor-pointer [&>option]:bg-[#30302e] [&>option]:text-white"
              style={{ colorScheme: "dark" }}
            >
              <option value="registrado">Registrado</option>
              <option value="desaparecido">Desaparecido</option>
              <option value="no-registrado">No Registrado</option>
            </select>
            <Icons.ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-secondary pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="block text-main font-bold">Fecha de Registro</label>
          <input
            type="date"
            className="w-56 bg-gris border border-sidebar-separador rounded-xl px-4 py-3 text-secondary focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </form>
    </ModalCrud>
  );
};
