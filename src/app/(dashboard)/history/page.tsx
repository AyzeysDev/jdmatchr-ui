// src/app/(dashboard)/history/page.tsx
"use client"; // Mark as a Client Component if you plan to use hooks for fetching data later

import React from 'react';
import { FileText, Calendar, AlertTriangle } from 'lucide-react'; // Example icons

// Define a type for an insight item (you can expand this later)
interface Insight {
  id: string;
  jobTitle: string;
  analyzedAt: string; // Or Date object
  matchScore: number;
  resumeFileName?: string;
}

// Mock data for insights - replace with actual data fetching later
const mockInsights: Insight[] = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Developer',
    analyzedAt: '2024-05-07',
    matchScore: 88,
    resumeFileName: 'my_frontend_resume_v3.pdf',
  },
  {
    id: '2',
    jobTitle: 'Full Stack Engineer (Remote)',
    analyzedAt: '2024-05-05',
    matchScore: 75,
    resumeFileName: 'fullstack_application.pdf',
  },
  {
    id: '3',
    jobTitle: 'Product Manager - SaaS',
    analyzedAt: '2024-04-28',
    matchScore: 92,
  },
  {
    id: '4',
    jobTitle: 'UX Designer',
    analyzedAt: '2024-04-15',
    matchScore: 60,
    resumeFileName: 'ux_portfolio_resume.pdf',
  },
];

export default function HistoryPage() {
  // In a real application, you would fetch this data, likely using a hook (e.g., useEffect, SWR, React Query)
  const insights = mockInsights;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analysis History
        </h1>
        <p className="text-muted-foreground mt-1">
          Review your past resume and job description analyses.
        </p>
      </header>

      {insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No History Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven&apos;t performed any analyses yet.
          </p>
          {/* Optional: Add a button to navigate to the analysis page */}
          {/*
          <Button className="mt-4">
            Analyze New JD
          </Button>
          */}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <FileText className="h-6 w-6 text-primary" />
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold
                      ${insight.matchScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      insight.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}
                  >
                    {insight.matchScore}% Match
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-semibold tracking-tight text-foreground truncate">
                  {insight.jobTitle}
                </h3>
                {insight.resumeFileName && (
                  <p className="text-xs text-muted-foreground truncate">
                    Resume: {insight.resumeFileName}
                  </p>
                )}
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  <span>Analyzed on: {new Date(insight.analyzedAt).toLocaleDateString()}</span>
                </div>
                {/* Optional: Add a button/link to view full insight details */}
                {/*
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View Details
                </Button>
                */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
