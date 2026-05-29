"use client";

import { BrainCircuit, ShieldCheck, TrendingUp } from "lucide-react";

export default function InfoHero() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl mb-8">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold mb-4">Gestión Inteligente de tus Finanzas</h2>
        <p className="text-blue-50 opacity-90 text-lg mb-8">
          FinGuard utiliza modelos avanzados de Machine Learning para proteger tu dinero y ayudarte a entender tus gastos automáticamente.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-semibold">Antifraude</h4>
              <p className="text-xs text-blue-100">Detección de anomalías en tiempo real.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BrainCircuit size={20} />
            </div>
            <div>
              <h4 className="font-semibold">Auto-Categoría</h4>
              <p className="text-xs text-blue-100">Clasificación inteligente de cada gasto.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 className="font-semibold">Predicción</h4>
              <p className="text-xs text-blue-100">Proyección de gastos futuros.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
