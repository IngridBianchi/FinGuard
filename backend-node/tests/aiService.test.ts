import axios from 'axios';
import { getPredictions } from '../src/services/aiService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('aiService', () => {
  it('should return prediction result when API calls are successful', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { categoria: 'Alimentación' } });
    mockedAxios.post.mockResolvedValueOnce({ data: { es_anomalia: false } });

    const result = await getPredictions('test description', 100);

    expect(result).toEqual({ categoria: 'Alimentación', es_anomalia: false });
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it('should throw error when API call fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

    await expect(getPredictions('test description', 100)).rejects.toThrow(
      'El servicio de análisis inteligente no está disponible actualmente.'
    );
  });
});
