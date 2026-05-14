import { Request, Response } from 'express';
import { Transaction } from '../services/database';
import { getPredictions } from '../services/aiService';
import { TransactionSchema } from '../schemas/transaction';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.findAll({
      limit: 50,
      order: [['fecha', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error en getTransactions:', error);
    res.status(500).json({ 
      error: 'Error al obtener transacciones',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    // Validar entrada
    const validation = TransactionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos de entrada inválidos', 
        details: validation.error.format() 
      });
    }

    const { descripcion, monto, fecha } = validation.data;
    
    // Obtener predicciones de la IA
    const predictions = await getPredictions(descripcion, monto);
    
    const newTransaction = await Transaction.create({
      descripcion,
      monto,
      fecha: fecha || new Date(),
      categoria: predictions.categoria,
      es_anomalia: predictions.es_anomalia
    });
    
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error en createTransaction:', error);
    
    // Si el error proviene del servicio de IA, devolvemos 503
    if (error instanceof Error && error.message.includes('análisis inteligente')) {
      return res.status(503).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Error interno al crear transacción',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
