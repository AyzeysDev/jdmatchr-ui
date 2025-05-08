// src/components/features/auth/SignOutButton.tsx
"use client";

import React from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn for conditional classes

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({
      callbackUrl: '/', // Redirect to landing page after sign out
    });
  };

  return (
    // Use Button with variant="ghost" and ensure styling matches nav links
    <Button
      variant="ghost"
      // Apply similar classes as sidebar nav links for alignment and spacing
      className={cn(
          "w-full cursor-pointer justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" /> {/* Ensure icon size matches nav links */}
      <span>Log out</span> {/* Wrap text in span if needed */}
    </Button>
  );
}
