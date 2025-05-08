// src/app/(dashboard)/home/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSearch, LineChart, PlusCircle } from 'lucide-react'; // Example icons

export const metadata: Metadata = {
  title: 'Dashboard | JDMatchr',
  description: 'Welcome to your JDMatchr dashboard.',
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Although layout should protect, double-check here is fine
  if (!session?.user) {
    redirect('/login?callbackUrl=/home');
  }

  const userName = session.user.name?.split(' ')[0] || 'User'; // Get first name or default

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Welcome back, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Ready to optimize your job application?
        </p>
      </div>

      {/* Button Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Analyze Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              New Analysis
            </CardTitle>
            <FileSearch className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Upload a resume and job description to get started.
            </CardDescription>
            <Button asChild size="lg" className="w-full">
              <Link href="/analyze">
                <PlusCircle className="mr-2 h-5 w-5" /> Start Analyzing
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Insights Card (Placeholder - maybe links to last report or history) */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              View Insights
            </CardTitle>
            <LineChart className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Review your previous analysis reports and suggestions.
            </CardDescription>
            {/* Link to /insights - might need logic later to link to specific/last report */}
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/insights">
                Go to Insights
              </Link>
            </Button>
             {/* Or link to a future /history page */}
             {/* <Button asChild variant="outline" size="lg" className="w-full"><Link href="/history">View History</Link></Button> */}
          </CardContent>
        </Card>

        {/* Add more cards here later if needed */}

      </div>
    </div>
  );
}
