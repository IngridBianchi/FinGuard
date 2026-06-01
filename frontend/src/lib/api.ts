import axios from 'axios';
import { Transaction } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:3001/api';

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get(`${API_URL}/transactions`);
  return response.data;
};

export const createTransaction = async (data: Partial<Transaction>): Promise<Transaction> => {
  const response = await axios.post(`${API_URL}/transactions`, data);
  return response.data;
};
