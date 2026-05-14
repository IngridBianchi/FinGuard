import axios from 'axios';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export interface PredictionResult {
  categoria: string;
  es_anomalia: boolean;
}

export const getPredictions = async (descripcion: string, monto: number): Promise<PredictionResult> => {
  try {
    const [catRes, anomRes] = await Promise.all([
      axios.post(`${PYTHON_API_URL}/api/v1/predict/category`, { descripcion, monto }),
      axios.post(`${PYTHON_API_URL}/api/v1/predict/anomaly`, { descripcion, monto })
    ]);

    return {
      categoria: catRes.data.categoria,
      es_anomalia: anomRes.data.es_anomalia
    };
  } catch (error) {
    console.error('Error crítico al llamar a FastAPI:', error);
    throw new Error('El servicio de análisis inteligente no está disponible actualmente.');
  }
};
