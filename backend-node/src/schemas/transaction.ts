import { z } from 'zod';

export const TransactionSchema = z.object({
  descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres").max(100),
  monto: z.number().positive("El monto debe ser un número positivo"),
  fecha: z.string().optional().or(z.date().optional()),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
