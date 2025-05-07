// src/components/common/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, after the component mounts
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Function to toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Until the component is mounted on the client, don't render the
  // theme-dependent part. You can render null or a placeholder/skeleton.
  if (!mounted) {
    // Render a placeholder button or null to avoid layout shift
    // A disabled button matching the size can be a good placeholder
    return <Button variant="outline" size="icon" disabled className="opacity-50" aria-hidden="true" />;
    // Or return null; if you prefer it not to take up space initially
  }

  // Once mounted, render the actual button with the correct icon
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      {/* <span className="sr-only">Toggle theme</span> - Replaced by aria-label */}
    </Button>
  );
}
