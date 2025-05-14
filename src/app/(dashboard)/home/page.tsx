// src/app/(dashboard)/home/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSearch, LineChart, PlusCircle, History, Wand2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | JDMatchr',
  description: 'Welcome to your JDMatchr dashboard.',
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/home');
  }

  const userName = session.user.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Welcome, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Ready to optimize your job application?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Analyze Card */}
        <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              New Analysis
            </CardTitle>
            <FileSearch className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <CardDescription className="mb-4">
              Upload a resume and job description to get started.
            </CardDescription>
            <Button asChild size="lg" className="w-full mt-auto">
              <Link href="/analyze">
                <PlusCircle className="mr-2 h-5 w-5" /> Start Analyzing
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              View Insights
            </CardTitle>
            <LineChart className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <CardDescription className="mb-4">
              Review your most recent analysis or browse your history.
            </CardDescription>
            <Button asChild variant="outline" size="lg" className="w-full mt-auto">
              <Link href="/insights">
                Go to Insights
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* History Card */}
        <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                    Analysis History
                </CardTitle>
                <History className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <CardDescription className="mb-4">
                    Access all your past resume and JD analysis reports.
                </CardDescription>
                <Button asChild variant="outline" size="lg" className="w-full mt-auto">
                    <Link href="/history">
                        View History
                    </Link>
                </Button>
            </CardContent>
        </Card>

        {/* Design Studio Card - Alignment fix for BETA badge */}
        <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 opacity-70 hover:opacity-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {/* Use flex and items-center for title and badge alignment */}
                <CardTitle className="text-xl font-semibold flex items-center space-x-2"> {/* Changed to items-center and added space-x-2 */}
                    <span>Design Studio</span> {/* Main title text */}
                    <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full self-center"> {/* self-center can also help fine-tune */}
                        BETA
                    </span>
                </CardTitle>
                <Wand2 className="h-6 w-6 text-emerald-500" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <CardDescription className="mb-4">
                    Craft and optimize your application materials. (Coming Soon)
                </CardDescription>
                <Button asChild variant="outline" size="lg" className="w-full mt-auto" disabled>
                    <Link href="/design">
                        Open Studio
                    </Link>
                </Button>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
