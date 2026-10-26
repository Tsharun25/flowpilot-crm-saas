import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Please enter a valid email").max(254).toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(254).toLowerCase(),
  password: z.string().min(1, "Password is required").max(72),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(254).toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(40).max(256),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirmPassword: z.string().min(1, "Please confirm your password").max(72),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
