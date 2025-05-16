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
  History,
  Wand2,
} from 'lucide-react';
import SignOutButton from '@/components/features/auth/SignOutButton';
import type { Session } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from '@/components/common/ThemeToggle';

// Define the structure for sidebar navigation items with color property
interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  iconColor: string; // Add color property for the icon
  isBeta?: boolean;
}

// Update the sidebar navigation items array with colors
const sidebarNavItems: SidebarNavItem[] = [
  { title: "Home", href: "/home", icon: Home, iconColor: "#f5bc42" },
  { title: "Analyze", href: "/analyze", icon: FileSearch, iconColor: "text-blue-500" },
  { title: "Insights", href: "/insights", icon: LineChart, iconColor: "text-purple-500" },
  { title: "History", href: "/history", icon: History, iconColor: "text-orange-500" },
  { title: "Design Studio", href: "/design", icon: Wand2, iconColor: "text-green-500", isBeta: true },
];

interface SidebarProps {
  session: Session | null;
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const user = session?.user;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() :
                      user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <div className="hidden md:flex md:flex-col md:w-64 border-r bg-background">
      <div className="flex h-full flex-col">

        {/* Sidebar Header Section - FileUser icon is now red */}
        <div data-sidebar="header" className="flex h-16 items-center justify-between border-b px-4 lg:px-6 shrink-0">
          <Link href="/home" className="flex items-center gap-2 font-semibold">
            <FileUser className="h-6 w-6 text-red-500" />
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
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-muted text-primary hover:bg-muted"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Apply the specific color to each icon */}
                <item.icon className={cn("h-4 w-4", 
  item.iconColor.startsWith("#") ? "" : item.iconColor)} 
  style={item.iconColor.startsWith("#") ? {color: item.iconColor} : undefined}
/>
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
            {/* User Info Row */}
            {user && (
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
            <SignOutButton />
        </div>

      </div>
    </div>
  );
}