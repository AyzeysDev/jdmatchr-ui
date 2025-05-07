// src/app/(dashboard)/insights/page.tsx
"use client"; // This page needs to be a client component to access context/client-side state

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { AnalysisContext } from '@/contexts/AnalysisContext'; // Assuming you have this context
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Placeholder type for analysis results - replace with your actual type later
interface AnalysisResult {
  atsScore?: number;
  benchmarkScore?: number;
  suggestions?: string[]; // Array of suggestion strings
  interviewGuide?: string[]; // Array of interview prep points
}

export default function InsightsPage() {
  const router = useRouter();
  // const { analysisResults, clearAnalysisResults } = useContext(AnalysisContext); // Get results from context
  const [isLoading, setIsLoading] = useState(true);

  // --- Mocked Data (Replace with Context/State) ---
  // In a real scenario, you'd get this from your context provider.
  // If context is empty (e.g., user navigated directly), redirect back or show error.
  const [mockResults, setMockResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Simulate fetching/checking context data
    // Replace this with: if (!analysisResults) { router.replace('/analyze'); } else { setIsLoading(false); }
    const timer = setTimeout(() => {
      setMockResults({
        atsScore: 82,
        benchmarkScore: 90,
        suggestions: [
          "Add keywords like 'Cloud Deployment' and 'Microservices Architecture'.",
          "Quantify achievements in previous roles (e.g., 'Increased efficiency by 15%').",
          "Expand on project management experience mentioned in the job description.",
          "Tailor the summary section to highlight relevant skills for this specific role.",
        ],
        interviewGuide: [
          "Be prepared to discuss your experience with Agile methodologies.",
          "Review common behavioral questions related to teamwork and problem-solving.",
          "Research recent company news and be ready to ask insightful questions.",
        ],
      });
      setIsLoading(false);
    }, 500); // Simulate loading delay

    return () => clearTimeout(timer); // Cleanup timer

    // Dependency array should include analysisResults when using context
  }, [router]); // Added router to dependency array for the redirect logic (if implemented)

  // Handle case where results are not available (e.g., direct navigation)
  // Or while loading
  if (isLoading || !mockResults) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
         {/* You can replace this with a Skeleton loader component */}
         <p className="text-muted-foreground">Loading analysis results...</p>
      </div>
    );
  }

  // Use the actual results once context is implemented: const results = analysisResults;
  const results = mockResults; // Using mocked data for now

  const handleGoBack = () => {
    // Optional: Clear results from context if needed when going back
    // clearAnalysisResults?.();
    router.push('/analyze'); // Navigate back to the analyze page
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Analysis Insights</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Here&apos;s the breakdown of your resume against the job description.
          </p>
        </div>
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Analyze Another
        </Button>
      </div>

      {/* Grid layout for key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATS Match Score</CardTitle>
            {/* Add an icon here later if desired */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.atsScore ?? 'N/A'}%</div>
            <p className="text-xs text-muted-foreground">
              Compared against the job description keywords.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.benchmarkScore ?? 'N/A'}+</div>
            <p className="text-xs text-muted-foreground">
              Recommended score for this role type.
            </p>
          </CardContent>
        </Card>
         {/* Add more cards here if needed */}
      </div>

      {/* Suggestions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Suggestions</CardTitle>
          <CardDescription>Actionable tips to improve your resume&apos;s alignment.</CardDescription>
        </CardHeader>
        <CardContent>
          {results.suggestions && results.suggestions.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              {results.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific suggestions provided.</p>
          )}
        </CardContent>
      </Card>

      {/* Interview Prep Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Prep Guide</CardTitle>
          <CardDescription>Key areas and potential questions based on the job description.</CardDescription>
        </CardHeader>
        <CardContent>
          {results.interviewGuide && results.interviewGuide.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              {results.interviewGuide.map((guide, index) => (
                <li key={index}>{guide}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific interview guidance provided.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
