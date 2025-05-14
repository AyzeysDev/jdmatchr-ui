// src/app/(dashboard)/analyze/page.tsx
"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, XCircle, UploadCloud } from 'lucide-react';
import { toast } from "sonner";

// More specific type for the nested analysisResult object
interface AnalysisResultDetail {
  overallMatchScore?: string;
  keywordAnalysis?: {
    matchedKeywords?: string[];
    missingKeywords?: string[];
    keywordDensityScore?: number;
  };
  resumeSuggestions?: string[]; // Matched 'suggestions' from your example
  interviewPreparationTopics?: string[];
  mockProcessingTimestamp?: string;
  // For fields directly from your example response:
  suggestions?: string[];
  keywordMatches?: string[];
  overallSentiment?: string;
  missingKeywords?: string[];
  atsScoreRaw?: number;
}

// Updated structure for the successful response from /api/analyze/process
interface AnalysisSuccessResponse {
  insightId: string;
  jobTitle?: string;
  matchScore?: number;
  analysisResult?: AnalysisResultDetail; // Use the specific type
  analysisDate?: string;
}

// Structure for an error response from the API route
interface ApiErrorResponse {
    message: string;
    rawError?: string;
}

export default function AnalyzePage() {
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
          setResumeFile(file);
          setResumeFileName(file.name);
          toast.dismiss();
          toast.success("Resume PDF selected: " + file.name, { duration: 2000 });
        } else {
          toast.error("File is too large", { description: "Maximum 5MB allowed for resume PDF."});
          setResumeFile(null);
          setResumeFileName('');
        }
      } else {
        toast.error("Invalid file type", { description: "Please upload a PDF file for your resume."});
        setResumeFile(null);
        setResumeFileName('');
      }
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Resume selection cleared.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim() || !resumeFile) {
      toast.error("Missing Information", {
        description: "Job title, job description, and a resume PDF are required.",
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Analyzing your documents, please wait...");

    const formData = new FormData();
    formData.append('jobTitle', jobTitle);
    formData.append('jobDescription', jobDescription);
    formData.append('resumeFile', resumeFile);

    try {
      const response = await fetch('/api/analyze/process', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error = responseData as ApiErrorResponse;
        console.error("Analysis submission failed:", error.message, error.rawError);
        toast.error("Analysis Failed", {
          id: toastId,
          description: error.message || "Could not process your request. Please try again.",
          duration: 5000,
        });
        setIsSubmitting(false); // Error occurred, re-enable button
        return;
      }

      const successData = responseData as AnalysisSuccessResponse;
      console.log("Analysis successful, backend response:", successData);

      if (!successData.insightId) {
        console.error("Analysis response from backend is missing 'insightId'. Response:", successData);
        toast.error("Processing Error", {
            id: toastId,
            description: "Analysis completed, but couldn't get the result ID. Please contact support.",
            duration: 7000,
        });
        setIsSubmitting(false); // Error in success response, re-enable button
        return;
      }

      toast.success("Analysis Complete!", {
        id: toastId,
        description: "Redirecting to your new insight report...",
        duration: 2000,
      });

      // setIsSubmitting can remain true here as redirect will happen
      setTimeout(() => {
        router.push(`/insights/${successData.insightId}`);
      }, 1500);

    } catch (error) {
      console.error("Error submitting analysis form or processing response:", error);
      const message = error instanceof Error ? error.message : "An unexpected network or client-side error occurred.";
      toast.error("Submission Error", {
        id: toastId,
        description: message,
        duration: 5000,
      });
      setIsSubmitting(false); // Network or other error, re-enable button
    }
    // No 'finally' block needed for setIsSubmitting if handled in all terminal paths of try/catch
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto shadow-lg dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-center">Analyze Your Fit</CardTitle>
          <CardDescription className="text-center">
            Upload your resume and paste a job description to get AI-powered insights.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-base font-medium">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="text-base"
                aria-describedby="jobTitleHelp"
              />
              <p id="jobTitleHelp" className="text-xs text-muted-foreground">The exact title of the role youre applying for.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-base font-medium">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                className="min-h-[250px] text-base resize-y"
                aria-describedby="jobDescriptionHelp"
              />
              <p id="jobDescriptionHelp" className="text-xs text-muted-foreground">Copy and paste the complete job description.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeFileTrigger" className="text-base font-medium">Upload Resume</Label>
              <div className="flex flex-col items-start space-y-2">
                <Button
                    type="button"
                    variant="outline"
                    id="resumeFileTrigger"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                    aria-describedby="resumeFileHelp"
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {resumeFileName ? "Change PDF" : "Select PDF (Max 5MB)"}
                </Button>
                <Input
                  id="resumeFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                {resumeFileName && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground border border-dashed border-border p-2 rounded-md w-full bg-muted/50">
                    <FileText className="h-5 w-5 shrink-0 text-primary" />
                    <span className="truncate flex-grow" title={resumeFileName}>{resumeFileName}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="h-7 w-7 shrink-0 group" aria-label="Remove selected resume file">
                      <XCircle className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                    </Button>
                  </div>
                )}
              </div>
               <p id="resumeFileHelp" className="text-xs text-muted-foreground">Only PDF files up to 5MB are accepted.</p>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" size="lg" className="w-full text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing... Please Wait
                </>
              ) : (
                "Analyze Now"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
