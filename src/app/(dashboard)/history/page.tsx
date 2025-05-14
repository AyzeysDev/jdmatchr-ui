// src/app/(dashboard)/history/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Calendar, History as HistoryIconLucide, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState'; // Ensure this path is correct
import { LoadingIndicator } from '@/components/common/LoadingComponent'; // Import the new loading indicator

// Define a type for an insight item from your backend
interface Insight {
  id: string; // UUID
  jobTitle: string;
  analysisDate: string; // ISO string from OffsetDateTime
  matchScore?: number; // Assuming this is what atsScore maps to
  resumeFilename?: string;
}

export default function HistoryPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/insights/history'); // Calls your Next.js API route
      if (!response.ok) {
        let errorMessage = `Failed to fetch history: ${response.statusText} (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.warn("Response from /api/insights/history was not JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }
      const data: Insight[] = await response.json(); // Expects an array of InsightSummaryDto compatible objects
      setInsights(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching your analysis history.");
      }
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || isNaN(new Date(dateString).getTime())) {
        return "Invalid Date";
      }
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <LoadingIndicator message="Loading analysis history..." fullPage={true} />
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-8 text-center">
         <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Error Loading History</h2>
        <p className="text-muted-foreground max-w-md mb-8">{error}</p>
        <Button
          onClick={fetchHistory}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <EmptyState
        Icon={HistoryIconLucide}
        title="Your Analysis Story Starts Here!"
        description="Analyze your resume and job descriptions, and all your insightful reports will be stored here for easy review and tracking."
        ctaText="Analyze Your First JD"
        ctaLink="/analyze"
      />
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Analysis History
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Review your past resume and job description analyses.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300 dark:border-slate-700 rounded-lg overflow-hidden">
            <CardHeader className="pb-4 bg-card/50 dark:bg-slate-800/30 p-5">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-7 w-7 text-primary" />
                {insight.matchScore !== undefined && insight.matchScore !== null && ( // Changed from atsScore
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full
                      ${insight.matchScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                      insight.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                      'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}
                  >
                    {insight.matchScore.toFixed(0)}% Match {/* Assuming matchScore is 0-100 */}
                  </span>
                )}
              </div>
              <CardTitle className="text-lg font-medium leading-tight truncate" title={insight.jobTitle}>
                {insight.jobTitle || "Untitled Analysis"}
              </CardTitle>
              {insight.resumeFilename && (
                <CardDescription className="text-xs text-muted-foreground truncate pt-1">
                  Resume: {insight.resumeFilename}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pt-4 p-5">
              <div className="text-sm text-muted-foreground mb-4">
                <Calendar className="inline-block mr-1.5 h-4 w-4 relative -top-px" />
                Analyzed: {formatDate(insight.analysisDate)}
              </div>
              <Button asChild variant="outline" className="w-full mt-auto">
                <Link href={`/insights/${insight.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
