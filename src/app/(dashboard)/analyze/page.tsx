"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
// Make sure CardHeader and CardDescription are imported if you plan to use them later, though they are not used in this fix.
import { Card, CardContent, CardFooter } from "@/components/ui/card"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, XCircle, UploadCloud, ArrowRight, Check } from 'lucide-react';
import { toast } from "sonner";
// import { cn } from "@/lib/utils"; // cn is not used, can be removed or kept for future use

// ... existing interfaces ...
interface AnalysisResultDetail {
  overallMatchScore?: string;
  keywordAnalysis?: {
    matchedKeywords?: string[];
    missingKeywords?: string[];
    keywordDensityScore?: number;
  };
  resumeSuggestions?: string[]; 
  interviewPreparationTopics?: string[];
  mockProcessingTimestamp?: string;
  suggestions?: string[];
  keywordMatches?: string[];
  overallSentiment?: string;
  missingKeywords?: string[];
  atsScoreRaw?: number;
}

interface AnalysisSuccessResponse {
  insightId: string;
  jobTitle?: string;
  matchScore?: number;
  analysisResult?: AnalysisResultDetail;
  analysisDate?: string;
}

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

  // ... existing handlers (handleFileChange, processSelectedFile, handleRemoveFile, handleSubmit) ...
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    if (file.type === "application/pdf") {
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        setResumeFile(file);
        setResumeFileName(file.name);
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
        setIsSubmitting(false);
        return;
      }

      const successData = responseData as AnalysisSuccessResponse;
      console.log("Analysis successful, backend response:", successData);

      if (!successData.insightId) {
        console.error("Analysis response is missing 'insightId'. Response:", successData);
        toast.error("Processing Error", {
          id: toastId,
          description: "Analysis completed, but couldn't get the result ID. Please contact support.",
          duration: 7000,
        });
        setIsSubmitting(false);
        return;
      }

      toast.success("Analysis Complete!", {
        id: toastId,
        description: "Redirecting to your new insight report...",
        duration: 2000,
      });

      setTimeout(() => {
        router.push(`/insights/${successData.insightId}`);
      }, 1500);

    } catch (error) {
      console.error("Error submitting analysis form:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Submission Error", {
        id: toastId,
        description: message,
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="py-3 px-4 md:px-0"> {/* Added horizontal padding for consistency on small screens for header */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Analyze Your Fit
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-0.5">
          Upload your resume and paste a job description to get AI-powered insights.
        </p>
      </div>

      <Card className="flex-1 flex flex-col shadow-sm border-muted/30 dark:border-slate-800 px-2 pt-3 pb-0"> {/* Removed overflow-hidden */}
        <CardContent className="px-4 pt-2 pb-0"> {/* Adjusted padding: px-4 for left/right, pt-2 for a small top padding, pb-4 for bottom */}
          <form onSubmit={handleSubmit} id="analysis-form"> {/* Removed space-y-5 */}
            {/* Job Title */}
            <div className="space-y-1.5 mb-4"> {/* Added mb-4 for spacing between form groups */}
              <Label htmlFor="jobTitle" className="text-lg font-medium">Job Title</Label> {/* Adjusted label size for consistency */}
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="h-10" // Standardized input height
              />
              <p className="text-xs text-muted-foreground">The exact title of the role youre applying for.</p>
            </div>

            {/* Job Description */}
            <div className="space-y-1.5 mb-4"> {/* Added mb-4 for spacing between form groups */}
              <Label htmlFor="jobDescription" className="text-lg font-medium">Job Description</Label> {/* Adjusted label size */}
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                className="h-[120px] resize-none" // Slightly more height for textarea
              />
              <p className="text-xs text-muted-foreground">Copy and paste the complete job description.</p>
            </div>

            {/* Resume upload */}
            <div className="space-y-1.5"> {/* Slightly increased spacing within group */}
              <Label htmlFor="resumeFile" className="text-lg font-medium">Upload Resume</Label> {/* Adjusted label size */}
              <div className="flex items-center gap-2">
                <Input
                  id="resumeFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                {!resumeFileName ? (
                  <Button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-1 h-10" // Standardized button height
                  >
                    <UploadCloud className="mr-1.5 h-4 w-4" />
                    Select Resume PDF
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 flex-1">
                    <Button 
                      type="button"
                      className="bg-green-500 hover:bg-green-600 text-white flex-1 h-10" // Standardized button height
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Check className="mr-1.5 h-4 w-4" />
                      PDF Selected
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRemoveFile}
                      className="h-10 px-2 text-muted-foreground hover:text-destructive" // Standardized button height
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {resumeFileName && (
                <p className="text-xs font-medium mt-1.5 text-green-600 dark:text-green-400 truncate max-w-full"> {/* Adjusted margin top */}
                  <FileText className="inline h-3 w-3 mr-1 mb-0.5" />
                  {resumeFileName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Only PDF files up to 5MB are accepted.</p>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="pt-6 flex justify-end"> {/* Consistent padding, added border-t for separation, and flex alignment */}
          <Button 
            type="submit"
            form="analysis-form"
            className="px-6 font-medium h-10" // Standardized button height
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Now 
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}