// src/app/(dashboard)/history/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Calendar, History as HistoryIconLucide, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState'; // Ensure this path is correct

// Define a type for an insight item
interface Insight {
  id: string;
  jobTitle: string;
  analysisDate: string; // Expecting ISO string or similar from backend
  atsScore?: number;
  resumeFileName?: string;
}

// Define the expected API response structure (if backend wraps insights)
// interface ApiResponse {
//   insights: Insight[];
//   // Add other potential fields like pagination info if needed later
// }

export default function HistoryPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/insights/history');
        if (!response.ok) {
          let errorMessage = `Failed to fetch history: ${response.statusText} (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            // If response is not JSON, use the initial error message
            console.warn("Response was not JSON:", jsonError);
          }
          throw new Error(errorMessage);
        }
        // Assuming backend returns an array of insights directly.
        // If it returns { insights: [...] }, use:
        // const data: ApiResponse = await response.json();
        // setInsights(data.insights);
        const data: Insight[] = await response.json();
        setInsights(data);
      } catch (err: unknown) { // Improved error typing
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
        console.error("Error fetching history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Format date utility
  const formatDate = (dateString: string) => {
    try {
      // Check if dateString is valid before parsing
      if (!dateString || isNaN(new Date(dateString).getTime())) {
        console.warn("Invalid date string received:", dateString);
        return "Invalid Date"; // Or return dateString as fallback
      }
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e: unknown) { // Improved error typing
      console.error("Error formatting date:", dateString, e);
      return dateString; // Fallback if date is not parsable despite checks
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <HistoryIconLucide className="w-12 h-12 text-muted-foreground animate-spin" />
        <p className="ml-3 text-muted-foreground">Loading analysis history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-4">
         <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive text-lg font-semibold">Error Loading History</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button
          onClick={() => {
            // Re-trigger fetchHistory
            setIsLoading(true);
            setError(null);
            // This is a simplified way to re-fetch. For more complex scenarios,
            // you might lift fetchHistory or use a state management library.
            const fetchAgain = async () => {
              try {
                const response = await fetch('/api/insights/history');
                if (!response.ok) {
                  let errorMessage = `Failed to fetch history: ${response.statusText} (Status: ${response.status})`;
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                  } catch (jsonError) { console.warn("Response was not JSON:", jsonError); }
                  throw new Error(errorMessage);
                }
                const data: Insight[] = await response.json();
                setInsights(data);
              } catch (err: unknown) {
                if (err instanceof Error) { setError(err.message); }
                else { setError("An unexpected error occurred."); }
                console.error("Error fetching history:", err);
              } finally { setIsLoading(false); }
            };
            fetchAgain();
          }}
          variant="outline"
          className="mt-4"
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
        title="Your Analysis Story Begins Now !"
        description="Analyze your resume and job descriptions, and all your insightful reports will be stored here for easy review and tracking."
        ctaText="Analyze Your First JD"
        ctaLink="/analyze" // Ensure this link is correct for your routing
      />
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Analysis History
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Review your past resume and job description analyses.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200 dark:border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-7 w-7 text-primary" />
                {insight.atsScore !== undefined && insight.atsScore !== null && (
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full
                      ${insight.atsScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                      insight.atsScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                      'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}
                  >
                    {insight.atsScore}% Match
                  </span>
                )}
              </div>
              <CardTitle className="text-lg leading-tight truncate" title={insight.jobTitle}>
                {insight.jobTitle || "Untitled Analysis"}
              </CardTitle>
              {insight.resumeFileName && (
                <CardDescription className="text-xs truncate pt-1">
                  Resume: {insight.resumeFileName}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pt-0">
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