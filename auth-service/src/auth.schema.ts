import z from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 5 characters long' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export const loginSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, { message: 'Credential is required' }),
});
