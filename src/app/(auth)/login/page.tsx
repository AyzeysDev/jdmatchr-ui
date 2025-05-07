// src/app/(auth)/login/page.tsx
import LoginForm from "@/components/features/auth/LoginForm"; // Assuming LoginForm is in this path
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | JDMatchr',
  description: 'Log in to your JDMatchr account.',
};

export default function LoginPage() {
  return (
    <LoginForm />
  );
}
