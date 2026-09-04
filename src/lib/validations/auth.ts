import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Antre yon imèl valid."),
  password: z.string().min(1, "Antre modpas ou."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  storeName: z.string().trim().min(2, "Non boutik la twò kout."),
  fullName: z.string().trim().min(2, "Non ou twò kout."),
  email: z.email("Antre yon imèl valid."),
  password: z
    .string()
    .min(8, "Modpas la dwe gen omwen 8 karaktè."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
