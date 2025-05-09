// src/components/layout/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  FileUser,
  Home,
  FileSearch,
  LineChart,
  History, // <-- Import History icon
  Wand2,   // <-- Import Wand2 icon (or Sparkles, HardHat) for Design Studio
  // Settings, // Example: if you have a settings page
  // UserCircle, // Example: if you have a profile page
} from 'lucide-react';
import SignOutButton from '@/components/features/auth/SignOutButton';
import type { Session } from 'next-auth'; // Import Session type
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from '@/components/common/ThemeToggle'; // Import ThemeToggle

// Define the structure for sidebar navigation items
interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ElementType; // Lucide icon component
  isBeta?: boolean; // Optional flag for beta features
}

// Update the sidebar navigation items array
const sidebarNavItems: SidebarNavItem[] = [
  { title: "Home", href: "/home", icon: Home },
  { title: "Analyze", href: "/analyze", icon: FileSearch },
  { title: "Insights", href: "/insights", icon: LineChart },
  // --- New Items Added ---
  { title: "History", href: "/history", icon: History },
  { title: "Design Studio", href: "/design", icon: Wand2, isBeta: true }, // Mark as BETA and PRO
  // --- End New Items ---
  // Example: Add other items like settings or profile if needed
  // { title: "Settings", href: "/settings", icon: Settings },
];

// Define props for the Sidebar, including the session object
interface SidebarProps {
  session: Session | null; // Accept the session passed from the layout
}

export function Sidebar({ session }: SidebarProps) { // Destructure session from props
  const pathname = usePathname();
  const user = session?.user;

  // Generate initials for Avatar Fallback using the prop session
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() :
                      user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <div className="hidden md:flex md:flex-col md:w-64 border-r bg-background">
      <div className="flex h-full flex-col">

        {/* Sidebar Header Section */}
        <div data-sidebar="header" className="flex h-16 items-center justify-between border-b px-4 lg:px-6 shrink-0">
          <Link href="/home" className="flex items-center gap-2 font-semibold">
            <FileUser className="h-6 w-6 text-primary" />
            <span className="">JDMatchr</span>
          </Link>
          {/* Theme Toggle Button */}
          <ThemeToggle />
        </div>

        {/* Sidebar Content Section (Main Navigation) */}
        <div data-sidebar="content" className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start px-2 lg:px-4 gap-1">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href} // Use href for key if titles might not be unique
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-muted text-primary hover:bg-muted"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
                {item.isBeta && (
                  <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                    BETA
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Section */}
        <div data-sidebar="footer" className="px-2 lg:px-4 py-4 border-t shrink-0 space-y-2">
            {/* User Info Row - Now uses the session prop */}
            {user && ( // Check if user exists in the passed session prop
              <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium">
                <Avatar className="h-8 w-8">
                    {user.image && <AvatarImage src={user.image} alt={user.name ?? ''} />}
                    <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                  {user.name || user.email}
                </span>
              </div>
            )}
            {/* SignOutButton still works as it uses useSession internally if needed, or just triggers signout */}
            <SignOutButton />
        </div>

      </div>
    </div>
  );
}
