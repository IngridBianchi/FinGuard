"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { createTransaction } from "@/lib/api";
import { Transaction } from "@/types";
import { toast } from "sonner";

interface TransactionFormProps {
  onSuccess: (newTx: Transaction) => void;
  hideTrigger?: boolean;
}

export const OPEN_MODAL_EVENT = "finguard:open_transaction_modal";

export default function TransactionForm({ onSuccess, hideTrigger = false }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{descripcion?: string, monto?: string}>({});
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_MODAL_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_MODAL_EVENT, handleOpen);
  }, []);

  const validate = () => {
    const newErrors: {descripcion?: string, monto?: string} = {};
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es requerida";
    const montoNum = parseFloat(formData.monto);
    if (isNaN(montoNum) || montoNum <= 0) newErrors.monto = "El monto debe ser mayor a 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const newTx = await createTransaction({
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha
      });
      
      toast.success("¡Gasto registrado exitosamente!", {
        description: `${newTx.descripcion} por $${newTx.monto.toLocaleString()}`,
      });

      onSuccess(newTx);
      setIsOpen(false);
      setFormData({ descripcion: "", monto: "", fecha: new Date().toISOString().split('T')[0] });
    } catch (error) {
      toast.error("Error al registrar el gasto", {
        description: "Por favor intenta de nuevo en unos momentos.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    if (hideTrigger) return null;
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
      >
        Nuevo Gasto
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Nuevo Gasto</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descripción</label>
            <input 
              type="text"
              placeholder="Ej: Cena restaurante, Suscripción..."
              className={`w-full p-3 bg-white dark:bg-slate-800 border rounded-xl outline-none transition ${errors.descripcion ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'}`}
              value={formData.descripcion}
              onChange={(e) => {
                setFormData({...formData, descripcion: e.target.value});
                if (errors.descripcion) setErrors({...errors, descripcion: undefined});
              }}
            />
            {errors.descripcion && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.descripcion}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monto ($)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`w-full p-3 bg-white dark:bg-slate-800 border rounded-xl outline-none transition ${errors.monto ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'}`}
                value={formData.monto}
                onChange={(e) => {
                  setFormData({...formData, monto: e.target.value});
                  if (errors.monto) setErrors({...errors, monto: undefined});
                }}
              />
              {errors.monto && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.monto}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fecha</label>
              <input 
                required
                type="date"
                className="w-full p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Analizando con IA...
                </>
              ) : "Guardar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
