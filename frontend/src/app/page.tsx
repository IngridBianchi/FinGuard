"use client";

import { useEffect, useState, useMemo } from "react";
import { getTransactions } from "@/lib/api";
import { Transaction } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  Loader2,
  Search,
  Filter
} from "lucide-react";
import TransactionForm from "@/components/TransactionForm";
import Charts from "@/components/Charts";
import PerformanceSection from "@/components/PerformanceSection";
import InfoHero from "@/components/InfoHero";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [anomalyFilter, setAnomalyFilter] = useState(false);

  useEffect(() => {
    getTransactions().then(data => {
      // Convertir es_anomalia de string/bigint a boolean explícito
      // El API devuelve '0' para false y '1' para true
      const formattedData = data.map((t: any) => ({
        ...t,
        es_anomalia: t.es_anomalia === '1' || t.es_anomalia === 1 || t.es_anomalia === true
      }));
      setTransactions(formattedData);
      setLoading(false);
    });
  }, []);

  const handleNewTransaction = (newTx: Transaction) => {
    setTransactions([newTx, ...transactions]);
  };

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(transactions.map(t => t.categoria)))], [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "Todas" || t.categoria === categoryFilter;
      const matchesAnomaly = !anomalyFilter || t.es_anomalia;
      return matchesSearch && matchesCategory && matchesAnomaly;
    });
  }, [transactions, searchTerm, categoryFilter, anomalyFilter]);

  const insights = useMemo(() => {
    const total = transactions.reduce((acc, t) => acc + t.monto, 0);
    const avg = transactions.length ? total / transactions.length : 0;
    const anomCount = transactions.filter(t => t.es_anomalia).length;
    const rate = transactions.length ? (anomCount / transactions.length) * 100 : 0;
    
    const catTotals = transactions.reduce((acc: any, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto;
      return acc;
    }, {});
    const topCat = Object.entries(catTotals).sort((a: any, b: any) => b[1] - a[1])[0] || ["N/A", 0];

    return { total, avg, rate, topCat };
  }, [transactions]);

  // Proyección simple: promedio diario * días del mes (30)
  const calculateProjection = () => {
    if (transactions.length === 0) return 0;
    const dates = transactions.map(t => new Date(t.fecha).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const diffDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
    const dailyAvg = insights.total / diffDays;
    return Math.round(dailyAvg * 30);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 min-h-screen">
      <div className="flex justify-between items-center">
        <TransactionForm onSuccess={handleNewTransaction} hideTrigger />
      </div>

      <InfoHero />

      <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">Panel de Control</h1>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardHeader><CardTitle className="text-sm text-slate-500">Gasto Total</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-slate-950 dark:text-white">${insights.total.toLocaleString()}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-slate-500">Promedio Diario</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-slate-950 dark:text-white">${insights.avg.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-slate-500">Top Categoría</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-slate-950 dark:text-white">{insights.topCat[0]}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-slate-500">Tasa Anomalías</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-slate-950 dark:text-white">{insights.rate.toFixed(1)}%</CardContent></Card>
      </div>

      <PerformanceSection transactions={transactions} />
      <Charts transactions={filteredTransactions} />

      {/* Tabla de Transacciones */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Últimas Transacciones</h2>
          
          {/* Filtros movidos aquí */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border rounded-lg text-sm bg-white dark:bg-slate-800">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={anomalyFilter} onChange={(e) => setAnomalyFilter(e.target.checked)} />
              <Filter size={16}/> Solo anomalías
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          {/* Vista de escritorio (Table) */}
          <table className="w-full text-left hidden md:table">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-4 font-medium">Fecha</th>
                <th className="px-4 py-4 font-medium">Descripción</th>
                <th className="px-4 py-4 font-medium">Categoría</th>
                <th className="px-4 py-4 font-medium text-right">Monto</th>
                <th className="px-4 py-4 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center">Cargando...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center">No hay datos.</td></tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{new Date(t.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{t.descripcion}</td>
                    <td className="px-4 py-4"><span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">{t.categoria}</span></td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white">${t.monto.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 mx-auto w-fit ${t.es_anomalia ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {t.es_anomalia ? <AlertTriangle size={10} /> : null} {t.es_anomalia ? 'Anomalía' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Vista móvil (Cards) */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay datos.</div>
            ) : (
              filteredTransactions.map((t) => (
                <div key={t.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{new Date(t.fecha).toLocaleDateString()}</p>
                      <h3 className="font-bold text-slate-900 dark:text-white">{t.descripcion}</h3>
                    </div>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">${t.monto.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-semibold uppercase tracking-wider">{t.categoria}</span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 ${t.es_anomalia ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                      {t.es_anomalia ? <AlertTriangle size={10} /> : null} {t.es_anomalia ? 'ANOMALÍA' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
