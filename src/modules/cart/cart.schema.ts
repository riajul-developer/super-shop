import { object, number, pipe, minValue, InferOutput } from 'valibot';

export const createCartSchema = object({
  productId: pipe(number(), minValue(1, 'Product id must be at least 1')),
  quantity: pipe(number(), minValue(1, 'Quantity must be at least 1')),
});

export const updateCartSchema = object({
  quantity: pipe(number(), minValue(1, 'Quantity must be at least 1')),
});

export type CreateCartType = InferOutput<typeof createCartSchema>;
export type UpdateCartType = InferOutput<typeof updateCartSchema>;