// src/components/features/auth/LoginForm.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormSchema, type LoginFormValues } from '@/lib/validators';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For redirecting after login

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import OAuthButtons from './OAuthButtons'; // Import the OAuthButtons component

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  // Success message might not be needed if redirecting immediately
  // const [success, setSuccess] = useState<string | undefined>("");
  const [isCredentialsPending, startCredentialsTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handler for email/password form submission
  const onCredentialsSubmit = (values: LoginFormValues) => {
    setError("");
    // setSuccess(""); // Not needed if redirecting

    startCredentialsTransition(async () => {
      console.log("Credentials login form submitted:", values);
      try {
        // This is where you'd call NextAuth's signIn with 'credentials'
        // or your custom Next.js API route that calls Spring Boot for credentials.
        // For now, we'll simulate the call to the placeholder Next.js API route.
        const response = await fetch('/api/auth/login', { // Your placeholder API route
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Invalid email or password.");
        } else {
          // On successful login with credentials, NextAuth (if configured for credentials)
          // would handle session creation. Or your custom logic would.
          // Then redirect.
          console.log("Credentials login successful (mocked):", data);
          router.push('/home'); // Redirect to dashboard
        }
      } catch (err) {
        setError("Failed to connect to the server. Please try again later.");
        console.error("Credentials login error:", err);
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground">Login to your account to continue.</p>
      </div>

      {/* Email/Password Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCredentialsSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isCredentialsPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                        tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} disabled={isCredentialsPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* Success message might be removed if redirecting immediately */}

          <Button type="submit" className="w-full cursor-pointer" disabled={isCredentialsPending}>
            {isCredentialsPending ? "Logging in..." : "Login with Email"}
          </Button>
        </form>
      </Form>

      {/* "Or continue with" Divider and OAuth Buttons */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-50 dark:bg-slate-900 px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <OAuthButtons />

      {/* Link to Signup Page */}
      <p className="text-center text-sm text-muted-foreground pt-4">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
