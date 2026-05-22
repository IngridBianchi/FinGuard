import request from 'supertest';
import app from '../src/app';
import { Transaction } from '../src/services/database';
import * as aiService from '../src/services/aiService';

// Mock de Sequelize Transaction
jest.mock('../src/services/database', () => ({
  Transaction: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
  __esModule: true,
  default: {
    authenticate: jest.fn(),
    query: jest.fn(),
  }
}));

// Mock del servicio de IA
jest.mock('../src/services/aiService');

describe('Transaction Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('should return 200 and a list of transactions', async () => {
      const mockTransactions = [
        { id: 1, descripcion: 'Test 1', monto: 100, categoria: 'Comida', es_anomalia: false },
        { id: 2, descripcion: 'Test 2', monto: 200, categoria: 'Transporte', es_anomalia: true },
      ];
      (Transaction.findAll as jest.Mock).mockResolvedValue(mockTransactions);

      const response = await request(app).get('/api/transactions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransactions);
      expect(Transaction.findAll).toHaveBeenCalledWith({
        limit: 50,
        order: [['fecha', 'DESC']],
      });
    });

    it('should return 500 if database fails', async () => {
      (Transaction.findAll as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/api/transactions');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error al obtener transacciones');
    });
  });

  describe('POST /api/transactions', () => {
    const validTransaction = {
      descripcion: 'Cena familiar',
      monto: 50.5,
      fecha: '2026-05-18T10:00:00.000Z',
    };

    it('should create a transaction and return 201', async () => {
      const mockAiResponse = { categoria: 'Comida', es_anomalia: false };
      const mockCreatedTransaction = { id: 1, ...validTransaction, ...mockAiResponse };

      (aiService.getPredictions as jest.Mock).mockResolvedValue(mockAiResponse);
      (Transaction.create as jest.Mock).mockResolvedValue(mockCreatedTransaction);

      const response = await request(app)
        .post('/api/transactions')
        .send(validTransaction);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreatedTransaction);
      expect(aiService.getPredictions).toHaveBeenCalledWith('Cena familiar', 50.5);
    });

    it('should return 400 for invalid data (zod validation)', async () => {
      const invalidData = { monto: 'not-a-number' };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    it('should return 503 if AI service is unavailable', async () => {
      (aiService.getPredictions as jest.Mock).mockRejectedValue(
        new Error('El servicio de análisis inteligente no está disponible actualmente.')
      );

      const response = await request(app)
        .post('/api/transactions')
        .send(validTransaction);

      expect(response.status).toBe(503);
      expect(response.body.error).toContain('análisis inteligente');
    });
  });
});
