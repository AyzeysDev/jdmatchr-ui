// src/app/(dashboard)/insights/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingIndicator } from '@/components/common/LoadingComponent';
import { LineChart, AlertTriangle } from 'lucide-react';

interface LatestInsightResponse {
  latestInsightId?: string | null;
  message?: string;
}

export default function GenericInsightsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const fetchLatestInsight = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setShowEmptyState(false);
    try {
      const response = await fetch('/api/insights/get-latest-id'); // Calls your Next.js API route
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 204) {
          console.log("[GenericInsightsPage] No latest insight found (API route returned 404/204). Showing empty state.");
          setShowEmptyState(true);
          setIsLoading(false);
          return;
        }
        let errorMessage = `Failed to fetch latest insight: ${response.statusText} (Status: ${response.status})`;
        try {
            const errorData: LatestInsightResponse = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
            console.warn("Response was not JSON when fetching latest insight:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const data: LatestInsightResponse = await response.json();

      if (data.latestInsightId) {
        router.replace(`/insights/${data.latestInsightId}`);
      } else {
        setShowEmptyState(true);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("Error fetching latest insight ID:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not load insights information due to an unexpected error.");
      }
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLatestInsight();
  }, [fetchLatestInsight]);

  if (isLoading) {
    return (
      <LoadingIndicator message="Loading your insights..." fullPage={true} />
    );
  }

  if (error) {
     return (
      <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-8 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Could Not Load Insights</h2>
        <p className="text-muted-foreground max-w-md mb-8">{error}</p>
        <Button onClick={fetchLatestInsight} variant="outline">
            Try Again
        </Button>
      </div>
    );
  }

  if (showEmptyState) {
    return (
      <EmptyState
        Icon={LineChart}
        title="Ready to Discover Your Resume's Potential ?"
        description="Get AI-powered feedback on your resume! See your match score, find areas to improve, and get tailored suggestions for any job description."
        ctaText="Start Your First Analysis"
        ctaLink="/analyze"
      />
    );
  }

  // Fallback content, should ideally not be reached if logic is sound
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <p className="text-muted-foreground">Preparing your insights page...</p>
    </div>
  );
}
