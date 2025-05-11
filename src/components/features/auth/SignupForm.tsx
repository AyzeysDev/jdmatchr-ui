// src/components/features/auth/SignupForm.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignupFormSchema, type SignupFormValues } from '@/lib/validators';
import Link from 'next/link';
// Optional: useRouter if you want to redirect after successful signup, e.g., to login page
// import { useRouter } from 'next/navigation';

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
import { Terminal, CheckCircle } from 'lucide-react'; // Added CheckCircle for success

export default function SignupForm() {
  // const router = useRouter(); // Uncomment if you plan to redirect
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "", // This is validated client-side, not sent to backend
    },
  });

  const onSubmit = (values: SignupFormValues) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      console.log("[SignupForm] Signup form submitted. Values (excluding confirmPassword for backend):", {
        name: values.name,
        email: values.email,
        password: values.password, // Password will be sent plain to your Next.js API route
      });
      try {
        // This Next.js API route needs to be created.
        // It will then call your Spring Boot backend's /api/v1/auth/register endpoint.
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Only send necessary fields to the backend (name, email, password)
          // confirmPassword is for client-side validation only.
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Expecting backend to return a JSON with a 'message' field on error
          setError(data.message || "An unexpected error occurred during registration.");
          console.error("[SignupForm] Registration error from /api/auth/register:", data);
        } else {
          setSuccess(data.message || "Registration successful! You can now log in.");
          console.log("[SignupForm] Registration successful:", data);
          form.reset(); // Reset form on success
          // Optional: Redirect to login page after a short delay or directly
          // setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err) {
        setError("Failed to connect to the registration service. Please check your internet connection and try again.");
        console.error("[SignupForm] Network or unexpected error during registration:", err);
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an Account</h1>
        <p className="text-muted-foreground">Join JDMatchr to get started.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isPending} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Registration Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-500/50 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> {/* Using CheckCircle for success */}
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
            {isPending ? "Creating Account..." : "Create an Account"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground pt-4">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
