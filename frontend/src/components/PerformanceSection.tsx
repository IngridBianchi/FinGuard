"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Activity, Zap, Cpu, HelpCircle } from "lucide-react";
import { Transaction } from "@/types";

interface PerformanceStats {
  latency_ms: number;
  throughput_s: number;
  total_processed: number;
}

interface PerformanceSectionProps {
  transactions: Transaction[];
}

export default function PerformanceSection({ transactions }: PerformanceSectionProps) {
  const [stats, setStats] = useState<PerformanceStats>({
    latency_ms: 0,
    throughput_s: 0,
    total_processed: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching ML stats:", error);
      }
    };

    fetchStats();
    
    // Polling más lento: cada 10 segundos en lugar de 5
    const interval = setInterval(fetchStats, 10000);
    
    // Limpieza crítica para evitar múltiples intervalos
    return () => clearInterval(interval);
  }, []);

  const anomalyDistribution = [
    { name: 'Anomalía', count: transactions.filter(t => t.es_anomalia).length, color: '#ef4444' },
    { name: 'Normal', count: transactions.filter(t => !t.es_anomalia).length, color: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Performance del Modelo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <Zap size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
              Latencia Última
              <span title="Tiempo que tarda la IA en procesar una transacción (ms)"><HelpCircle size={14} className="cursor-help" /></span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.latency_ms} ms</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Cpu size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
              Rendimiento
              <span title="Predicciones realizadas por segundo (tps)"><HelpCircle size={14} className="cursor-help" /></span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.throughput_s} tps</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
              Total Procesado
              <span title="Número total de transacciones analizadas por la IA"><HelpCircle size={14} className="cursor-help" /></span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_processed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Distribución de Predicciones</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={anomalyDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {anomalyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
