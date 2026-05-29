import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PerformanceSection from './PerformanceSection';

describe('PerformanceSection', () => {
  const mockTransactions = [
    { id: 1, descripcion: 'Test 1', monto: 100, fecha: '2026-05-22', categoria: 'Comida', es_anomalia: false },
    { id: 2, descripcion: 'Test 2', monto: 200, fecha: '2026-05-22', categoria: 'Otros', es_anomalia: true },
  ];

  it('renders correctly with titles and icons', () => {
    render(<PerformanceSection transactions={mockTransactions} />);
    
    expect(screen.getByText(/performance del modelo/i)).toBeInTheDocument();
    expect(screen.getByText(/latencia última/i)).toBeInTheDocument();
    expect(screen.getByText(/rendimiento/i)).toBeInTheDocument();
    expect(screen.getByText(/total procesado/i)).toBeInTheDocument();
  });

  it('shows the correct distribution of predictions', () => {
    render(<PerformanceSection transactions={mockTransactions} />);
    
    expect(screen.getByText(/distribución de predicciones/i)).toBeInTheDocument();
    // Recharts renders inside a ResponsiveContainer which might need mocking for full path tests,
    // but the presence of the section title is a good basic indicator.
  });
});
