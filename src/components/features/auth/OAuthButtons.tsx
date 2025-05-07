// src/components/features/auth/OAuthButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa"; // Using react-icons for Google logo
import React, { useState } from "react";

// Ensure you have react-icons installed: npm install react-icons

export default function OAuthButtons() {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleOAuthSignIn = async (provider: "google") => {
    setIsLoadingGoogle(true);

    try {
      // callbackUrl: Redirect to this page after successful OAuth login.
      // Adjust as needed, e.g., to your dashboard.
      await signIn(provider, { callbackUrl: "/analyze" });
      // Note: signIn redirects, so code after it might not run if successful.
    } catch (error) {
      console.error(`OAuth sign-in error with ${provider}:`, error);
      // Optionally, display an error message to the user using a toast or alert
      setIsLoadingGoogle(false); // Reset loading state on error
    }
    // Don't set loading to false here if signIn initiates a redirect successfully
  };

  return (
    // Removed grid layout as there's only one button now
    <div className="mt-4"> 
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => handleOAuthSignIn("google")}
        disabled={isLoadingGoogle}
      >
        {isLoadingGoogle ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <FaGoogle className="h-4 w-4" />
        )}
        Sign in with Google
      </Button>
      {/* GitHub Button Removed */}
    </div>
  );
}
