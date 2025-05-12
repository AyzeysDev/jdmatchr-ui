// src/components/features/auth/SignupForm.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignupFormSchema, type SignupFormValues } from '@/lib/validators';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react"; // <--- Import signIn for auto-login

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
import { Terminal, CheckCircle } from 'lucide-react';

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: SignupFormValues) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      console.log("[SignupForm] Signup form submitted. Values for registration:", {
        name: values.name,
        email: values.email,
        // Password is not logged for security
      });
      try {
        // Step 1: Register the user via your backend
        const registerResponse = await fetch('/api/auth/register', { // Calls your Next.js API proxy
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          setError(registerData.message || "An unexpected error occurred during registration.");
          console.error("[SignupForm] Registration error from /api/auth/register:", registerData);
          return; // Stop if registration failed
        }

        // Registration was successful
        console.log("[SignupForm] Registration successful via backend:", registerData);
        form.reset();
        setSuccess("Registration successful! Attempting to log you in...");

        // Step 2: Attempt to automatically log in the user
        console.log("[SignupForm] Attempting auto-login for:", values.email);
        const loginResult = await signIn('credentials', {
          redirect: false, // We handle the redirect manually
          email: values.email,
          password: values.password, // Use the password they just signed up with
        });

        if (loginResult?.ok && !loginResult?.error) {
          console.log("[SignupForm] Auto-login successful after signup.");
          setSuccess("Registration and login successful! Redirecting to dashboard...");
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push('/home'); // Or your desired dashboard page
            router.refresh(); // Optional: to refresh server components if needed
          }, 1500);
        } else {
          // Auto-login failed, which is unexpected if registration was fine.
          // Guide user to login manually.
          console.error("[SignupForm] Auto-login failed after signup:", loginResult?.error);
          setError(loginResult?.error || "Registration was successful, but auto-login failed. Please try logging in manually.");
          setSuccess(""); // Clear initial success message
          // Optionally redirect to login page after a delay
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }

      } catch (err) { // Catch errors from the fetch call to /api/auth/register or other unexpected issues
        setError("Failed to connect to the registration service. Please try again.");
        console.error("[SignupForm] Network or unexpected error during registration process:", err);
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
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && !error && ( // Only show success if there's no overriding error
            <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-500/50 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Processing...</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
            {isPending ? "Processing..." : "Create an Account"}
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
