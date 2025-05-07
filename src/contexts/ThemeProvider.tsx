// src/contexts/ThemeProvider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// Corrected import path for ThemeProviderProps
import type { ThemeProviderProps } from "next-themes"; // Types are usually exported from the main package entry

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // attribute="class": Tells next-themes to set the theme by adding/removing a class (e.g., "dark") on the <html> element.
  // defaultTheme="system": The default theme will be based on the user's system preference.
  // enableSystem: Allows users to choose "system" preference.
  // disableTransitionOnChange: Prevents transitions when changing themes to avoid flashes.
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
