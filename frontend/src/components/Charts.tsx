"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Transaction } from '@/types';

interface ChartsProps {
  transactions: Transaction[];
}

export default function Charts({ transactions }: ChartsProps) {
  // Procesar datos para el gráfico: Agrupar por fecha y sumar montos
  const chartData = transactions
    .reduce((acc: any[], curr) => {
      const date = new Date(curr.fecha).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.amount += curr.monto;
      } else {
        acc.push({ date, amount: curr.monto });
      }
      return acc;
    }, [])
    .slice(-15) // Últimos 15 días con datos
    .reverse();

  // Si no hay datos, no renderizamos el contenedor para evitar errores de renderizado
  if (!chartData || chartData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Tendencia de Gastos (Últimos registros)</h3>
        {/* Usar un div contenedor con dimensiones explícitas y forzar renderizado condicional */}
        <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              {/* ... resto del componente ... */}
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Gasto']}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
