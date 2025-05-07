// src/app/(auth)/layout.tsx
import React from 'react';
import Link from 'next/link';
import { FileUser } from 'lucide-react'; // Your chosen icon

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-900"> {/* Moved common background to parent */}
      {/* Left Column: Form Area */}
      {/*
        - Added `flex-grow` so this column expands to fill vertical space on mobile.
        - On mobile (default, since md:w-1/2 applies only from md breakpoint), this column is the primary content.
        - `justify-center` will now work as expected because this div will have height.
      */}
      <div className="w-full md:w-1/2 flex flex-col flex-grow items-center justify-center p-6 sm:p-8 md:p-12 order-2 md:order-1">
        <div className="w-full max-w-md"> {/* Constrains the width of the form itself */}
          {children} {/* This is where SignupForm or LoginForm will be rendered */}
        </div>
      </div>

      {/* Right Column: Brand/Info Area - HIDDEN ON MOBILE */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col items-center justify-center p-6 sm:p-8 md:p-12 bg-gradient-to-br from-primary to-primary-focus text-primary-foreground order-1 md:order-2">
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center space-y-3 group mb-8 hover:opacity-90 transition-opacity">
            <FileUser className="h-16 w-16 sm:h-20 sm:w-20 text-primary-foreground group-hover:scale-105 transition-transform" />
            <span className="text-3xl sm:text-4xl font-bold tracking-tight">JDMatchr</span>
          </Link>
          <p className="text-lg sm:text-xl max-w-xs mx-auto">
            Unlock insights. Perfect your application.
          </p>
        </div>
      </div>
    </div>
  );
}
