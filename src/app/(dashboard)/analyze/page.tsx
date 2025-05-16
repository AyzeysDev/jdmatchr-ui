"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, XCircle, UploadCloud, ArrowRight, Check } from 'lucide-react';
import { toast } from "sonner";

// Define the Zod schema for react-hook-form
const analysisFormSchema = z.object({
  jobTitle: z.string()
    .min(1, { message: "Job title is required." })
    .min(3, { message: "Job title must be at least 3 characters." })
    .max(100, { message: "Job title must be 100 characters or less." }),
  jobDescription: z.string()
    .min(1, { message: "Job description is required." })
    .min(50, { message: "Job description must be at least 50 characters." })
    .max(10000, { message: "Job description is too long (max 10,000 characters)." }),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

// Interfaces for API response handling
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
    },
    mode: "onChange",
  });

  // File handling logic
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
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      toast.error("Invalid file type", { description: "Please upload a PDF file for your resume."});
      setResumeFile(null);
      setResumeFileName('');
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  // Form submission logic
  const onSubmit = async (data: AnalysisFormValues) => {
    if (!resumeFile) {
      toast.error("Missing Information", {
        description: "A resume PDF is required.",
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Analyzing your documents, please wait...");

    const formData = new FormData();
    formData.append('jobTitle', data.jobTitle);
    formData.append('jobDescription', data.jobDescription);
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
    // Flex container to manage height and scrolling within the page
    // The parent <main> in DashboardLayout provides the overall scroll context
    // This aims to make the form area scrollable if it's too tall,
    // rather than always making the entire dashboard main content scroll.
    <div className="flex flex-col" style={{ height: 'calc(100vh - var(--header-height, 4rem) - 2rem)' }}>
      {/* Adjust --header-height based on your actual dashboard header height */}
      {/* The -2rem is for top/bottom padding of the parent <main> or this component's own desired padding */}

      {/* Page Header - stays fixed at the top of this component's view */}
      <div className="py-3 px-4 md:px-0 shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Analyze Your Fit
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-0.5">
          Upload your resume and paste a job description to get AI-powered insights.
        </p>
      </div>

      {/* Form container - this will grow and scroll if content overflows */}
      <div className="flex-grow overflow-y-auto px-4 md:px-0 pb-6 pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      {...field}
                      className="h-10"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The exact title of the role youre applying for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the full job description here..."
                      {...field}
                      className="min-h-[150px] h-20 resize-y overflow-y-auto" // Fixed height, internal scroll
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Copy and paste the complete job description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="text-lg font-medium">Upload Resume</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  {!resumeFileName ? (
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-orange-500 hover:bg-orange-600 text-white h-11 px-8 text-base"
                      disabled={isSubmitting}
                    >
                      <UploadCloud className="mr-2 h-5 w-5" />
                      Select Resume PDF
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        className="bg-green-500 hover:bg-green-600 text-white h-11 px-6 text-base truncate"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        title={resumeFileName}
                      >
                        <Check className="mr-2 h-5 w-5 shrink-0" />
                        <span className="truncate">{resumeFileName}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="h-11 w-11 text-muted-foreground hover:text-destructive shrink-0"
                        disabled={isSubmitting}
                        aria-label="Remove selected file"
                      >
                        <XCircle className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Only PDF files up to 5MB are accepted.
              </FormDescription>
            </FormItem>

            {/* Submit Button Area - Aligned to the right */}
            <div className="flex justify-left pt-4">
              <Button
                type="submit"
                className="px-6 font-medium h-10 text-sm"
                disabled={isSubmitting || !form.formState.isValid && form.formState.isSubmitted}
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
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
