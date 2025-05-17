// src/app/(dashboard)/analyze/page.tsx
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

// Minimal interface for the expected successful response for THIS page's needs
interface MinimalProcessResponse {
  id: string;
  // Only 'id' is strictly needed here for redirection.
  // Other top-level fields from the full backend response could be added if used.
}

// Interface for API error responses
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

      // response.json() returns a Promise<any>, so treat responseData as unknown initially
      const responseData: unknown = await response.json();
      console.log("[AnalyzePage onSubmit] Raw responseData from Next.js API route /api/analyze/process:", JSON.stringify(responseData, null, 2));


      if (!response.ok) {
        // Assuming error response conforms to ApiErrorResponse or has a message property
        const errorResponse = responseData as ApiErrorResponse;
        console.error("Analysis submission failed via Next.js API route. Status:", response.status, "Response:", errorResponse);
        toast.error(errorResponse?.message || "Analysis Failed", {
          id: toastId,
          description: `Server responded with status ${response.status}. Please check details and try again.`,
          duration: 7000,
        });
        setIsSubmitting(false);
        return;
      }

      // Type guard to check if responseData is a valid MinimalProcessResponse
      // Parameter 'res' is typed as 'unknown' for better type safety.
      const isSuccessResponse = (res: unknown): res is MinimalProcessResponse => {
        return typeof res === 'object' && res !== null && 'id' in res && typeof (res as MinimalProcessResponse).id === 'string' && (res as MinimalProcessResponse).id.trim() !== '';
      };

      if (isSuccessResponse(responseData)) {
        // Now TypeScript knows responseData is MinimalProcessResponse
        const insightId = responseData.id;
        console.log("[AnalyzePage onSubmit] Successfully found insightId:", insightId);

        toast.success("Analysis Complete!", {
          id: toastId,
          description: "Redirecting to your new insight report...",
          duration: 2000,
        });

        setTimeout(() => {
          router.push(`/insights/${insightId}`);
        }, 1500);
      } else {
        console.error("Analysis response OK, but missing a valid 'id' string or not matching MinimalProcessResponse. ResponseData:", responseData);
        toast.error("Processing Error", {
          id: toastId,
          description: "Analysis completed, but the result ID was not found or the response format was unexpected. Please contact support.",
          duration: 7000,
        });
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error("Error submitting analysis form (client-side fetch/JSON parse issue):", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred during submission.";
      toast.error("Submission Error", {
        id: toastId,
        description: message,
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - var(--header-height, 4rem) - 2rem)' }}>
      <div className="py-3 px-4 md:px-0 shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Analyze Your Fit
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-0.5">
          Upload your resume and paste a job description to get AI-powered insights.
        </p>
      </div>
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
                      className="min-h-[200px] h-60 resize-y overflow-y-auto"
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
            <div className="flex justify-end pt-4">
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
