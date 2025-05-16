// src/app/(dashboard)/layout.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/layout/SideBar';
import { MobileHeader } from '@/components/layout/MobileHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Redirect to login, preserving the intended callback URL
    redirect('/login?callbackUrl=/home');
  }

  return (
    // Main container for the entire dashboard view
    // h-screen: Sets height to 100% of the viewport height
    // overflow-hidden: Prevents this container itself from scrolling
    <div className="flex h-screen w-full overflow-hidden bg-muted/40 dark:bg-slate-950">
      {/* Sidebar: Fixed width, its internal content will scroll if needed */}
      <Sidebar session={session} />

      {/* Main content column: Takes remaining width and manages its own overflow */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header: Fixed part of the main content column, does not scroll */}
        <MobileHeader /> {/* Ensure MobileHeader has a defined height */}

        {/* Scrollable main content area */}
        {/* flex-1: Allows this area to grow and take available vertical space */}
        {/* overflow-y-auto: Enables vertical scrolling ONLY for this main area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children} {/* Page content (e.g., InsightDetailPage) renders here */}
        </main>
      </div>
    </div>
  );
}
