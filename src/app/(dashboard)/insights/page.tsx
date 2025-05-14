// src/app/(dashboard)/insights/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState'; // Import the EmptyState component
import { LineChart, Loader2, AlertTriangle } from 'lucide-react'; // Icons

interface LatestInsightResponse {
  latestInsightId?: string | null; // UUID string or null
  message?: string; // Optional error message
}

export default function GenericInsightsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestInsight = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // This Next.js API route will call your Spring Boot backend
        const response = await fetch('/api/insights/get-latest-id'); // Create this API route
        
        if (!response.ok) {
          const errorData: LatestInsightResponse = await response.json();
          // If backend specifically says "not found" or "no content" for latest, it's not an error for this page's logic
          if (response.status === 404 || response.status === 204) {
             // No latest insight found, stay on this page to show empty state
             setIsLoading(false);
             return;
          }
          throw new Error(errorData.message || `Failed to fetch latest insight: ${response.statusText}`);
        }

        const data: LatestInsightResponse = await response.json();

        if (data.latestInsightId) {
          router.replace(`/insights/${data.latestInsightId}`);
        } else {
          // No latest insight found, stay on this page to show empty state
          setIsLoading(false);
        }
      } catch (err: unknown) { // Changed from any to unknown
        console.error("Error fetching latest insight ID:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Could not load insights information due to an unexpected error.");
        }
        setIsLoading(false); // Stop loading on error
      }
    };

    fetchLatestInsight();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 min-h-[calc(100vh-20rem)]">
        <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading your insights...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 min-h-[calc(100vh-20rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive text-lg mb-2">Could not load insights.</p>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  // This content is shown if isLoading is false AND there was no latestInsightId to redirect to AND no error
  return (
    <EmptyState
      Icon={LineChart} // Icon representing insights/analytics
      title="Ready to Discover Your Resume's Potential ?"
      description="Get AI-powered feedback on your resume! See your match score, find areas to improve, and get tailored suggestions for any job description."
      ctaText="Start Your First Analysis"
      ctaLink="/analyze"
    />
  );
}
