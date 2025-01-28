import { object, string, minLength, email, pipe } from 'valibot';
import * as v from 'valibot';

export const registerSchema = object({
  name: pipe(
    string(),
    minLength(3, 'Username must be at least 3 characters long')
  ),
  email: pipe(string(), email('Invalid email address')),
  password: pipe(
    string(),
    minLength(6, 'Password must be at least 6 characters long')
  ),
});

export type registerDataType = v.InferOutput<typeof registerSchema>;