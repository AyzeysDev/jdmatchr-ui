// src/app/(auth)/signup/page.tsx
import SignupForm from "@/components/features/auth/SignupForm"; // Assuming SignupForm is in this path
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | JDMatchr', // Updated title
  description: 'Sign up for JDMatchr to analyze resumes and job descriptions with AI.',
};

export default function SignupPage() {
  // The AuthGroupLayout (src/app/(auth)/layout.tsx) now provides the
  // two-column layout, background colors, and centering.
  // This page component simply needs to render the SignupForm.
  return (
    <SignupForm />
  );
}
