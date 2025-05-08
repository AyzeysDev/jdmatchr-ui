// src/components/layout/MobileHeader.tsx
"use client";

import React from 'react'; // Import React
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetDescription, // Keep for accessibility
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { Menu, FileUser, Home, FileSearch, LineChart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SignOutButton from '../features/auth/SignOutButton';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ThemeToggle } from '@/components/common/ThemeToggle'; // Import ThemeToggle
// Session prop is removed as per user request
// import type { Session } from 'next-auth';

// Re-define or import nav items if needed
const sidebarNavItems = [
  { title: "Home", href: "/home", icon: Home },
  { title: "Analyze", href: "/analyze", icon: FileSearch },
  { title: "Insights", href: "/insights", icon: LineChart },
];

// export function MobileHeader({ session }: MobileHeaderProps) { // Removed session from props
export function MobileHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden sticky top-0 z-40">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0"> {/* Removed default padding */}
          <SheetHeader className="border-b px-4 py-4"> {/* Added padding and border */}
            <SheetTitle>
              <Link
                href="/home"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsOpen(false)}
              >
                <FileUser className="h-6 w-6 text-primary" />
                <span>JDMatchr</span>
              </Link>
            </SheetTitle>
            <VisuallyHidden>
              <SheetDescription>
                Main navigation menu for JDMatchr dashboard.
              </SheetDescription>
            </VisuallyHidden>
          </SheetHeader>
          {/* Navigation links inside the sheet */}
          {/* Use flex-1, overflow-auto, consistent padding and gap */}
          <nav className="grid items-start px-2 lg:px-4 gap-1">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost' }), // Use button variant styling
                  "flex items-center justify-start gap-3 rounded-md px-3 py-2 text-base font-medium", // Consistent alignment, padding, gap, text size
                  pathname === item.href
                    ? "bg-muted text-primary hover:bg-muted" // Active state
                    : "text-muted-foreground hover:text-foreground" // Inactive state
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" /> {/* Slightly larger icon */}
                {item.title}
              </Link>
            ))}
          </nav>
          {/* Logout button at the bottom */}
          {/* Use consistent padding */}
          <div className="mt-auto border-t p-4">
             {/* SignOutButton should internally use similar styling for its button */}
             <SignOutButton />
          </div>
        </SheetContent>
      </Sheet>

      {/* Optional: Add user menu/avatar to mobile header if desired */}
      <div className="flex-1 text-right">
        {/* Placeholder */}
        <ThemeToggle />
      </div>
    </header>
  );
}
