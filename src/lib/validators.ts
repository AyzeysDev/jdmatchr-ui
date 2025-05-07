// src/lib/validators.ts
import * as z from "zod";

// --- Schema for the Signup/Registration form ---
export const SignupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100, { message: "Name must be 100 characters or less." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Point the error to the confirmPassword field
});

export type SignupFormValues = z.infer<typeof SignupFormSchema>;

// --- Schema for the Login form ---
export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Basic check, can be more complex
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;


// --- Schema for the Analysis form ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for resume
const ACCEPTED_RESUME_TYPES = ["application/pdf"]; // Only accept PDF for now

export const AnalysisFormSchema = z.object({
  jobTitle: z.string()
    .min(3, { message: "Job title must be at least 3 characters." })
    .max(100, { message: "Job title must be 100 characters or less." })
    .trim(), // Added trim for good measure
  resumeFile: z
    .custom<FileList>( // Use FileList for input type="file"
        (val) => val instanceof FileList, // Check if it's a FileList
        "Resume file is required."
     )
    .refine((files) => files?.length === 1, "Please upload one resume file.") // Ensure exactly one file is uploaded
    .transform(files => files[0] as File) // Get the single File object from the FileList
    .refine(
        (file) => file?.size <= MAX_FILE_SIZE,
        `Resume file size must be less than 5MB.` // Check file size
    )
    .refine(
        (file) => ACCEPTED_RESUME_TYPES.includes(file?.type),
        "Invalid file type. Only PDF resumes are accepted." // Check file type
    ),
  jobDescription: z.string()
    .min(50, { message: "Job description must be at least 50 characters." }) // Example minimum length
    .max(10000, { message: "Job description is too long (max 10,000 characters)." }) // Example maximum length
    .trim(), // Added trim
});

// Type inferred from the Zod schema for use in react-hook-form
export type AnalysisFormValues = z.infer<typeof AnalysisFormSchema>;

// Optional: Type for the actual data sent to the API (might differ slightly, e.g., file handling)
// This isn't strictly necessary if the form values match the API payload directly.
export interface AnalysisApiPayload {
    jobTitle: string;
    resumeFile: File; // The actual file object
    jobDescription: string;
}
