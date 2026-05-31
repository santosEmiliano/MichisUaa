import { useState } from "react";
import { ModalCrud } from "./ModalCrud";
import type { Colonia } from "../types/models";

export interface ColoniaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initial?: Colonia | null;
  onSave: (data: ColoniaFormSave) => void;
  users: { id: string; nombre: string }[];
}

export interface ColoniaFormSave {
  id?: number;
  name: string;
  location: string;
  description: string;
  responsableIds: string[];
}

const defaultForm = (): ColoniaFormSave => ({
  name: "",
  location: "",
  description: "",
  responsableIds: [],
});

function formFromProps(
  mode: "create" | "edit",
  initial: Colonia | null | undefined,
): ColoniaFormSave {
  if (mode === "edit" && initial) {
    return {
      name: initial.name,
      location: initial.location,
      description: initial.description,
      responsableIds: initial.responsableIds || [],
    };
  }
  return defaultForm();
}

export const ColoniaModal = ({
  isOpen,
  onClose,
  mode,
  initial,
  onSave,
  users,
}: ColoniaModalProps) => {
  const [form, setForm] = useState<ColoniaFormSave>(() =>
    formFromProps(mode, initial),
  );

  const title = mode === "create" ? "Nueva colonia" : "Editar colonia";

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-[#e8893c] hover:bg-[#e8893c]/10 focus:border-[#e8893c] focus:bg-[#e8893c]/10 transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="colonia-form"
        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl border border-[#e8893c] bg-[#e8893c] text-white font-bold hover:brightness-110 shadow-[0_4px_15px_rgba(232,137,60,0.3)] transition-all duration-200"
      >
        {mode === "create" ? "Crear colonia" : "Guardar cambios"}
      </button>
    </div>
  );

  const inputClass =
    "w-full bg-gris border border-sidebar-separador rounded-xl px-4 py-3 text-main text-sm focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] transition-all duration-200 placeholder-secondary hover:border-acento-naranja";

  return (
    <ModalCrud isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <form
        id="colonia-form"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (form.responsableIds.length === 0) {
            alert("Debes seleccionar al menos un encargado");
            return;
          }
          onSave({
            ...form,
            ...(mode === "edit" && initial ? { id: initial.id } : {}),
          });
          onClose();
        }}
      >
        <div>
          <label
            className="block text-main font-bold mb-1.5 text-sm"
            htmlFor="colonia-name"
          >
            Nombre
          </label>
          <input
            id="colonia-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej. Edificio 108"
            className={inputClass}
          />
        </div>

        <div>
          <label
            className="block text-main font-bold mb-1.5 text-sm"
            htmlFor="colonia-location"
          >
            Ubicación
          </label>
          <input
            id="colonia-location"
            type="text"
            required
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="Ej. Zona central - Ed. 108"
            className={inputClass}
          />
        </div>

        <div>
          <label
            className="block text-main font-bold mb-1.5 text-sm"
            htmlFor="colonia-desc"
          >
            Descripción
          </label>
          <textarea
            id="colonia-desc"
            required
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Breve descripción del área y contexto de la colonia."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-main font-bold mb-1.5 text-sm">
            Encargados de Colonia
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {users.map((o) => (
              <label key={o.id} className="flex items-center gap-3 cursor-pointer bg-gris border border-sidebar-separador rounded-xl px-4 py-3 hover:border-[#e8893c] transition-colors">
                <input
                  type="checkbox"
                  value={o.id}
                  checked={form.responsableIds.includes(o.id)}
                  onChange={(e) => {
                    const newIds = e.target.checked 
                      ? [...form.responsableIds, o.id]
                      : form.responsableIds.filter(id => id !== o.id);
                    setForm(f => ({ ...f, responsableIds: newIds }));
                  }}
                  className="w-5 h-5 text-[#e8893c] bg-gris border-sidebar-separador rounded focus:ring-[#e8893c] focus:ring-2 focus:ring-offset-2 focus:ring-offset-gris-oscuro"
                />
                <span className="text-[15px] text-main truncate" title={o.nombre}>{o.nombre}</span>
              </label>
            ))}
          </div>
          {form.responsableIds.length === 0 && (
            <p className="text-xs text-red-400 mt-1">Debes seleccionar al menos un encargado.</p>
          )}
        </div>
      </form>
    </ModalCrud>
  );
};
