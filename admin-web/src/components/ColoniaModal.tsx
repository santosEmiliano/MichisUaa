import { useState } from "react";
import { ModalCrud } from "./ModalCrud";
import Icons from "./Icons";
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
  alerta: boolean;
  responsableId: string;
}

const defaultForm = (): ColoniaFormSave => ({
  name: "",
  location: "",
  description: "",
  alerta: false,
  responsableId: "",
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
      alerta: initial.alerta ?? false,
      responsableId: initial.responsableId,
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
    <div className="flex gap-4 w-full justify-end flex-wrap">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-acento-naranja hover:bg-[rgba(232,137,60,0.18)] focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.18)] transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="colonia-form"
        className="px-6 py-2.5 rounded-xl border border-[#e8893c] bg-[var(--bg-active-item)] text-[#e8893c] font-bold hover:bg-[rgba(232,137,60,0.30)] hover:border-acento-naranja transition-all duration-200"
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
          <label
            className="block text-main font-bold mb-1.5 text-sm"
            htmlFor="colonia-responsable"
          >
            Responsable
          </label>
          <div className="relative">
            <select
              id="colonia-responsable"
              required
              value={form.responsableId}
              onChange={(e) =>
                setForm((f) => ({ ...f, responsableId: e.target.value }))
              }
              className="appearance-none w-full bg-gris border border-sidebar-separador text-secondary rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 cursor-pointer [&>option]:bg-[#30302e] [&>option]:text-white"
              style={{ colorScheme: "dark" }}
            >
              <option value="" disabled>Seleccione un encargado</option>
              {users.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
            <Icons.ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-secondary pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-sidebar-separador bg-gris px-4 py-3">
          <div>
            <p className="font-bold text-main text-sm">Alerta</p>
            <p className="text-xs text-secondary mt-0.5">
              Activa badge y acentos en rojo en la tarjeta
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.alerta}
            onClick={() => setForm((f) => ({ ...f, alerta: !f.alerta }))}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              form.alerta
                ? "bg-[#c84b4b]"
                : "bg-gris-oscuro border border-sidebar-separador"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                form.alerta ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </form>
    </ModalCrud>
  );
};
