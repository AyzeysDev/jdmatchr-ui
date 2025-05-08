// src/app/(dashboard)/layout.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/layout/SideBar'; // Import the Sidebar component
import { MobileHeader } from '@/components/layout/MobileHeader'; // Import MobileHeader

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- Authentication Check & Get Session (Server-Side) ---
  const session = await getServerSession(authOptions); // Already fetching session here

  if (!session?.user) {
    redirect('/login?callbackUrl=/home');
  }
  // --- End Authentication Check ---

  return (
    <div className="flex min-h-screen w-full bg-muted/40 dark:bg-slate-950">

      {/* Pass the server-fetched session data as a prop to Sidebar */}
      <Sidebar session={session} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Pass session to MobileHeader as well if it needs user info */}
        <MobileHeader />

        {/* Page Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
