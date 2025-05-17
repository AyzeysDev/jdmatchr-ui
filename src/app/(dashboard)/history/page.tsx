// src/app/(dashboard)/history/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Calendar, History as HistoryIconLucide, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState'; // Ensure this path is correct
import { LoadingIndicator } from '@/components/common/LoadingComponent'; // Import the new loading indicator
import { cn } from '@/lib/utils'; // Import the cn utility

// Define a type for an insight item from your backend
interface Insight {
  id: string; // UUID
  jobTitle: string;
  analysisDate: string; // ISO string from OffsetDateTime
  matchScore?: number; // Assuming this is what atsScore maps to
  atsScore?: number; // Optional ATS score
  resumeFilename?: string;
}

export default function HistoryPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get an icon based on score
  const getScoreIcon = (score: number | undefined | null, type: 'match' | 'ats'): React.ReactNode => {
    if (score === null || score === undefined) return null;
    const iconSize = "h-4 w-4"; // Standard icon size
    if (type === 'match') {
      if (score >= 80) return <TrendingUp className={cn(iconSize, "text-green-500")} />;
      if (score < 60) return <TrendingDown className={cn(iconSize, "text-red-500")} />;
    } else if (type === 'ats') {
      if (score >= 70) return <TrendingUp className={cn(iconSize, "text-sky-500")} />;
      if (score < 50) return <TrendingDown className={cn(iconSize, "text-rose-500")} />;
    }
    // For scores in the middle range, or if no specific up/down trend is desired
    return <TrendingUp className={cn(iconSize, "text-muted-foreground opacity-60")} />;
  };

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
                <FileText className="h-7 w-7 text-red-500" />
                <div className="flex items-center space-x-2">
                  {/* Display match score with trend icon */}
                  {insight.matchScore !== undefined && insight.matchScore !== null && (
                    <div className="flex items-center gap-1">
                      {getScoreIcon(insight.matchScore, 'match')}
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full
                          ${insight.matchScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300' :
                          insight.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300'}`}
                      >
                        {insight.matchScore.toFixed(0)}%
                      </span>
                    </div>
                  )}
                  
                  {/* Display ATS score with trend icon if available */}
                  {insight.atsScore !== undefined && insight.atsScore !== null && (
                    <div className="flex items-center gap-1">
                      {getScoreIcon(insight.atsScore, 'ats')}
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full
                          ${insight.atsScore >= 70 ? 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300' :
                          insight.atsScore >= 50 ? 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-300'}`}
                      >
                        ATS {insight.atsScore}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <CardTitle className="text-xl font-semibold leading-tight truncate" title={insight.jobTitle}>
                {insight.jobTitle || "Untitled Analysis"}
              </CardTitle>
              {insight.resumeFilename && (
                <CardDescription className="text-xs text-muted-foreground truncate pt-1">
                  Resume: {insight.resumeFilename}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between p-5 pt-3">
              <div className="text-sm text-muted-foreground mb-4">
                <Calendar className="inline-block mr-1.5 h-4 w-4 relative -top-px" />
                Analyzed: {formatDate(insight.analysisDate)}
              </div>
              <div className="pt-4 pb-1">
                <Button asChild variant="outline" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 border-0 hover:text-white">
                  <Link href={`/insights/${insight.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}