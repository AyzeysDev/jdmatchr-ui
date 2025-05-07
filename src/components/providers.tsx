// src/components/providers.tsx
"use client"; // Mark this component as a Client Component

import React from 'react';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/ThemeProvider"; // Your theme provider

// Define the props type, expecting children
interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // This component now acts as the client boundary for your context providers
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
