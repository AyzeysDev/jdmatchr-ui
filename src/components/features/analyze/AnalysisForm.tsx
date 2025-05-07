"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // Import Resolver type
import { AnalysisFormSchema } from "@/lib/validators";
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

type AnalysisFormInput = {
  jobTitle: string;
  resumeFile?: FileList;
  jobDescription: string;
};

export default function AnalysisForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AnalysisFormInput>({
    resolver: zodResolver(AnalysisFormSchema) as Resolver<AnalysisFormInput>, // Explicitly cast resolver
    defaultValues: {
      jobTitle: "",
      resumeFile: undefined,
      jobDescription: "",
    },
    mode: "onChange",
  });

  const resumeFileWatcher = form.watch("resumeFile");
  useEffect(() => {
    if (resumeFileWatcher instanceof FileList && resumeFileWatcher.length > 0) {
      setFileName(resumeFileWatcher[0].name);
    } else {
      setFileName(null);
    }
  }, [resumeFileWatcher]);

  const onSubmit: SubmitHandler<AnalysisFormInput> = (values) => {
    setError("");
    console.log("Analysis form submitted with values:", values);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("jobTitle", values.jobTitle);

      if (values.resumeFile instanceof FileList && values.resumeFile.length > 0) {
        formData.append("resumeFile", values.resumeFile[0], values.resumeFile[0].name);
      } else {
        setError("Invalid resume file data.");
        return;
      }

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
          router.push("/insights");
        }
      } catch (err) {
        setError("Failed to submit analysis. Please check your connection.");
        console.error("Analysis submission error:", err);
      }
    });
  };

  const handleClearFile = () => {
    form.resetField("resumeFile");
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      if (e.target.files) {
                        onChange(e.target.files);
                      }
                    }}
                    onBlur={onBlur}
                    name={name}
                    ref={(e) => {
                      ref(e);
                      fileInputRef.current = e as HTMLInputElement;
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

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="w-full text-lg cursor-pointer" disabled={isPending}>
          {isPending ? "Analyzing..." : "Analyze Now"}
        </Button>
      </form>
    </Form>
  );
}