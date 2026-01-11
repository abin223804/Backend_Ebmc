import { z } from "zod";

export const createUserSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "USER"]),
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email"),
  country: z.string().optional(),
  state: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  trn: z.string().optional(),
  creditLimit: z.number().min(0),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
