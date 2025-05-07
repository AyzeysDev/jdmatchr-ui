// src/components/features/auth/LoginForm.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormSchema, type LoginFormValues } from '@/lib/validators';
import Link from 'next/link';

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

export default function LoginForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>(""); // Or for 2FA prompts
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      console.log("Login form submitted:", values);
      try {
        const response = await fetch('/api/auth/login', { // Placeholder Next.js API route
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Invalid email or password.");
        } else {
          setSuccess(data.message || "Login successful! Redirecting...");
          form.reset();
          // TODO: Implement actual session handling and redirect
          console.log("Login successful, token (mocked):", data.token);
        }
      } catch (err) {
        setError("Failed to connect to the server.");
        console.error("Login error:", err);
      }
    });
  };

  return (
    <div className="w-full space-y-6"> 
      <div className="text-center md:text-left"> 
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground">Login to your account to continue.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* Form fields spacing */}
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password" // Placeholder for forgot password page
                        className="text-sm font-medium text-primary hover:underline"
                        tabIndex={-1} // Optional: manage focus order
                  >
                    Forgot password?
                  </Link>
                </div>
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
          {success && (
             <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}