// src/app/(dashboard)/analyze/page.tsx
import type { Metadata } from 'next';
import AnalysisForm from '@/components/features/analyze/AnalysisForm'; // Import the form

// Note: Authentication check should ideally happen in the layout
// (src/app/(dashboard)/layout.tsx) using getServerSession or middleware
// to protect all dashboard routes consistently.

export const metadata: Metadata = {
  title: 'Analyze Resume & JD | JDMatchr',
  description: 'Upload your resume and job description for AI-powered analysis.',
};

export default function AnalyzePage() {
  return (
    // The container and max-width help constrain the form on wider screens
    // within the dashboard layout's main content area.
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Analyze Your Application
        </h1>
        <p className="text-lg text-muted-foreground">
          Provide your resume, the target job title, and the job description to get started.
        </p>
      </div>
      {/* Render the AnalysisForm component */}
      <AnalysisForm />
    </div>
  );
}
