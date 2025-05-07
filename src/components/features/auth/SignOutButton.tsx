    // src/components/features/auth/SignOutButton.tsx
    "use client";

    import React from 'react';
    import { signOut } from 'next-auth/react';
    import { Button } from '@/components/ui/button'; // Use Button for styling consistency
    import { LogOut } from 'lucide-react';

    export default function SignOutButton() {
      const handleSignOut = () => {
        signOut({
          callbackUrl: '/', // Redirect to landing page after sign out
          // redirect: true // Default is true
        });
      };

      return (
        // Use a Button styled to look like a dropdown item, or adjust as needed
        <Button
          variant="ghost"
          className="w-full h-full justify-start px-2 py-1.5 text-sm font-normal"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      );
    }
    