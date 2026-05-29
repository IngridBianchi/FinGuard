export interface Transaction {
  id: number;
  fecha: string;
  monto: number;
  categoria: string;
  descripcion: string;
  es_anomalia: boolean;
}

export interface DashboardSummary {
  totalGasto: number;
  countAnomalias: number;
  prediccionProxima: number;
}
