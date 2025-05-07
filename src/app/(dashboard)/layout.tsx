// src/app/(dashboard)/layout.tsx
import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Your NextAuth config
import { Button } from '@/components/ui/button';
import { UserCircle, FileText } from 'lucide-react'; // Example icons
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For user display
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // For user menu/logout
import { ThemeToggle } from '@/components/common/ThemeToggle'; // Reuse theme toggle
import SignOutButton from '@/components/features/auth/SignOutButton'; // A client component for sign out

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- Authentication Check (Server-Side) ---
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    // Redirect to login page if not authenticated
    // Include callbackUrl so user is redirected back after login
    redirect('/login?callbackUrl=' + encodeURIComponent(process.env.NEXTAUTH_URL + '/analyze')); // Adjust callback as needed
  }
  // --- End Authentication Check ---

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0 md:px-6">
          {/* Brand/Logo */}
          <Link href="/analyze" className="flex items-center space-x-2 text-lg font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold hidden sm:inline-block">JDMatchr</span>
          </Link>


          {/* Right Side: Theme Toggle & User Menu */}
          <div className="flex flex-1 items-center justify-end space-x-4">
             <ThemeToggle />
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {/* Display user image if available from session */}
                      {session.user.image ? (
                         <AvatarImage src={session.user.image} alt={session.user.name ?? 'User avatar'} />
                      ) : (
                         <UserCircle className="h-8 w-8 text-muted-foreground" /> // Fallback icon
                      )}
                      <AvatarFallback>
                        {/* Fallback initials */}
                        {session.user.name ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name ?? 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email ?? 'No email'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Add links to Profile/Settings pages here later */}
                  {/* <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  {/* Logout Button */}
                  <DropdownMenuItem className="p-0">
                     {/* Use a client component for signOut */}
                     <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto py-6 md:py-10 px-4 md:px-6">
        {children} {/* This is where /analyze or /insights page content will be rendered */}
      </main>

      {/* Optional Footer for Dashboard */}
      {/* <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} JDMatchr
      </footer> */}
    </div>
  );
}
