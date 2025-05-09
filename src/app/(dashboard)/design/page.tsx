// src/app/(dashboard)/design/page.tsx
"use client"; // Mark as a Client Component

import React from 'react';
import { HardHat, Sparkles } from 'lucide-react'; // Example icons

export default function DesignPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-6">
        <Sparkles className="mx-auto h-16 w-16 text-primary animate-pulse" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        JDMatchr Design Studio
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This exciting new feature is currently under construction!
      </p>
      <p className="mt-2 text-muted-foreground">
        Our team is hard at work crafting an amazing experience to help you design and optimize your application materials.
        Stay tuned for updates!
      </p>
      <div className="mt-8">
        <HardHat className="mx-auto h-12 w-12 text-amber-500" />
      </div>
      {/* Optional: Add a link back to the dashboard or home */}
      {/*
      <Link href="/dashboard" className="mt-10">
        <Button variant="outline">
          Back to Dashboard
        </Button>
      </Link>
      */}
    </div>
  );
}
