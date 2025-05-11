// src/components/features/auth/LoginForm.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormSchema, type LoginFormValues } from '@/lib/validators';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { signIn } from "next-auth/react"; // <--- Import signIn from NextAuth

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
import OAuthButtons from './OAuthButtons';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params for callbackUrl
  // Get callbackUrl from query parameters, default to '/home' if not present
  const callbackUrl = searchParams.get('callbackUrl') || '/home';

  const [error, setError] = useState<string | undefined>("");
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
    setError(""); // Clear previous errors

    startCredentialsTransition(async () => {
      console.log("[LoginForm] Attempting NextAuth credentials sign-in with:", values);
      try {
        // Use NextAuth's signIn function for credentials
        const result = await signIn('credentials', {
          redirect: false, // We'll handle redirect manually to show errors
          email: values.email,
          password: values.password,
          // callbackUrl is not directly used by 'credentials' like this,
          // but NextAuth might pick it up if redirect was true.
          // We will redirect manually on success.
        });

        console.log("[LoginForm] NextAuth signIn result:", result);

        if (result?.error) {
          // 'result.error' will contain the message from your 'authorize' function's throw new Error()
          // or a generic NextAuth.js error message (e.g., "CredentialsSignin").
          // You might want to map "CredentialsSignin" to a more user-friendly message.
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password. Please try again.");
          } else {
            setError(result.error);
          }
          console.error("[LoginForm] NextAuth Credentials SignIn Error:", result.error);
        } else if (result?.ok && !result?.error) {
          // Successful login, NextAuth has set the session cookie
          console.log("[LoginForm] NextAuth Credentials SignIn Successful.");
          // Redirect to the callbackUrl (from query param) or default to '/home'
          router.push(callbackUrl);
          router.refresh(); // Optional: refresh server components if needed
        } else {
          // Fallback for unexpected result structure
          setError("An unknown login error occurred. Please try again.");
          console.warn("[LoginForm] Unknown NextAuth signIn result structure:", result);
        }
      } catch (err) { // Catch network errors or unexpected issues with the signIn call itself
        setError("Failed to connect to the login service. Please check your internet connection and try again.");
        console.error("[LoginForm] Error calling NextAuth signIn:", err);
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
                  <Link href="/forgot-password" // Assuming you might add this page later
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
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
          <span className="bg-background px-2 text-muted-foreground"> {/* Use bg-background for theme adaptability */}
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
