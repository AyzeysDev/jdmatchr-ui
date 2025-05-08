"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, UploadCloud, FileText as FileIcon, XCircle } from "lucide-react";

// Simplified Zod Schema - temporarily removes complex file validation
// We'll handle basic file presence check in the component/submit logic
const SimpleAnalysisFormSchema = z.object({
  jobTitle: z.string()
    .min(3, { message: "Job title must be at least 3 characters." })
    .max(100, { message: "Job title must be 100 characters or less." })
    .trim(),
  // Keep resumeFile as 'any' for now to bypass complex Zod/RHF file issues temporarily
  // We will validate its presence manually in onSubmit
  resumeFile: z.any().optional(), // Make optional in schema, check manually later
  jobDescription: z.string()
    .min(50, { message: "Job description must be at least 50 characters." })
    .max(10000, { message: "Job description is too long (max 10,000 characters)." })
    .trim(),
});

// Type based on the simplified schema
type SimpleAnalysisFormValues = z.infer<typeof SimpleAnalysisFormSchema>;

export default function AnalysisForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SimpleAnalysisFormValues>({
    resolver: zodResolver(SimpleAnalysisFormSchema),
    defaultValues: {
      jobTitle: "",
      resumeFile: undefined, // Default value for file input
      jobDescription: "",
    },
    mode: "onChange",
  });

  // Watch the resumeFile field to update the displayed file name
  const resumeFileWatcher = form.watch("resumeFile");
  useEffect(() => {
    const fileList = resumeFileWatcher as FileList | undefined; // RHF stores it as FileList
    if (fileList && fileList.length > 0) {
      setFileName(fileList[0].name);
    } else {
      setFileName(null);
    }
  }, [resumeFileWatcher]);

  // Function to clear the selected file
  const handleClearFile = () => {
    form.resetField("resumeFile"); // Reset RHF field
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the native file input
    }
  };

  // Handle form submission
  const onSubmit: SubmitHandler<SimpleAnalysisFormValues> = (values) => {
    setError("");
    console.log("Analysis form submitted with values:", values);

    // Manual check for file presence
    const resumeFileList = values.resumeFile as FileList | undefined;
    if (!resumeFileList || resumeFileList.length === 0) {
      setError("Please upload a resume file.");
      // Optionally set error specifically for the field
      form.setError("resumeFile", { type: "manual", message: "Resume file is required." });
      return;
    }
    const resumeFile = resumeFileList[0];

    // Basic file type/size check (optional here, can be done server-side too)
    if (resumeFile.type !== "application/pdf") {
        setError("Invalid file type. Only PDF resumes are accepted.");
        form.setError("resumeFile", { type: "manual", message: "Only PDF files are accepted." });
        return;
    }
    if (resumeFile.size > 5 * 1024 * 1024) { // 5MB
        setError("Resume file size must be less than 5MB.");
        form.setError("resumeFile", { type: "manual", message: "File must be less than 5MB." });
        return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("jobTitle", values.jobTitle);
      formData.append("resumeFile", resumeFile, resumeFile.name); // Append the actual File
      formData.append("jobDescription", values.jobDescription);

      try {
        const response = await fetch("/api/analyzer/process", {
          method: "POST",
          body: formData,
        });

        const resultData: { message?: string } = await response.json();

        if (!response.ok) {
          setError(resultData.message || `Analysis failed: ${response.statusText}`);
        } else {
          console.log("Analysis successful (mocked):", resultData);
          // TODO: Store resultData in context/state management
          router.push("/insights");
        }
      } catch (err) {
        setError("Failed to submit analysis. Please check your connection.");
        console.error("Analysis submission error:", err);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Job Title Field */}
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Job Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  {...field}
                  disabled={isPending}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resume Upload Field */}
        <FormField
          control={form.control}
          name="resumeFile"
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Upload Your Resume (PDF)</FormLabel>
              <FormControl>
                <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/50 rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 hover:border-primary transition-colors dark:bg-slate-800/30 dark:hover:bg-slate-800/60">
                  <Input
                    id="resume-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        onChange(files); // Pass FileList to RHF
                      }
                    }}
                    onBlur={onBlur}
                    name={name}
                    ref={(e) => {
                      ref(e); // RHF's ref
                      fileInputRef.current = e; // Local ref
                    }}
                    disabled={isPending}
                  />
                  {!fileName ? (
                    <label
                      htmlFor="resume-upload"
                      className="flex flex-col items-center justify-center pt-5 pb-6 text-center cursor-pointer w-full h-full"
                    >
                      <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF only (MAX. 5MB)</p>
                    </label>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center w-full h-full">
                      <FileIcon className="w-10 h-10 mb-3 text-primary" />
                      <p
                        className="mb-1 text-sm font-semibold text-foreground truncate max-w-[90%]"
                        title={fileName}
                      >
                        {fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">PDF file selected</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive hover:text-destructive z-10 relative"
                        onClick={handleClearFile}
                        disabled={isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Job Description Field */}
        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Paste Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste the full job description here..."
                  className="resize-y min-h-[200px] text-base bg-background dark:bg-slate-800/50 border-border"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error Message Display Area */}
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button type="submit" size="lg" className="w-full text-lg cursor-pointer" disabled={isPending}>
          {isPending ? "Analyzing..." : "Analyze Now"}
        </Button>
      </form>
    </Form>
  );
}