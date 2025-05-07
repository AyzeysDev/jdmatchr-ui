import * as z from "zod";

export const SignupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100, { message: "Name must be 100 characters or less." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], 
});

export type SignupFormValues = z.infer<typeof SignupFormSchema>;

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }), 
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;
