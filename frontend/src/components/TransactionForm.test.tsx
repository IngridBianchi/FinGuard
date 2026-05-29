import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionForm from './TransactionForm';
import * as api from '@/lib/api';
import { toast } from 'sonner';

// Mock the API
vi.mock('@/lib/api', () => ({
  createTransaction: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TransactionForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when button is clicked', () => {
    render(<TransactionForm onSuccess={mockOnSuccess} />);
    
    const button = screen.getByRole('button', { name: /nuevo gasto/i });
    fireEvent.click(button);
    
    expect(screen.getByText(/registrar nuevo gasto/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<TransactionForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /nuevo gasto/i }));
    
    fireEvent.click(screen.getByRole('button', { name: /guardar gasto/i }));
    
    expect(await screen.findByText(/la descripción es requerida/i)).toBeInTheDocument();
    expect(await screen.findByText(/el monto debe ser mayor a 0/i)).toBeInTheDocument();
  });

  it('submits successfully when data is valid and calls toast.success', async () => {
    const mockTx = { id: 1, descripcion: 'Prueba', monto: 100, fecha: '2026-05-22', categoria: 'Otros', es_anomalia: false };
    (api.createTransaction as any).mockResolvedValue(mockTx);

    render(<TransactionForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /nuevo gasto/i }));
    
    fireEvent.change(screen.getByPlaceholderText(/ej: cena restaurante/i), { target: { value: 'Cena' } });
    fireEvent.change(screen.getByPlaceholderText(/0.00/i), { target: { value: '100' } });
    
    fireEvent.click(screen.getByRole('button', { name: /guardar gasto/i }));
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/gasto registrado exitosamente/i), expect.any(Object));
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(mockTx);
  });

  it('shows error feedback via toast when API fails', async () => {
    (api.createTransaction as any).mockRejectedValue(new Error('API Error'));

    render(<TransactionForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /nuevo gasto/i }));
    
    fireEvent.change(screen.getByPlaceholderText(/ej: cena restaurante/i), { target: { value: 'Cena' } });
    fireEvent.change(screen.getByPlaceholderText(/0.00/i), { target: { value: '100' } });
    
    fireEvent.click(screen.getByRole('button', { name: /guardar gasto/i }));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/error al registrar el gasto/i), expect.any(Object));
    });
  });
});
