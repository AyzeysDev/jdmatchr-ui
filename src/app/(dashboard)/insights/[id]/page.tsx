// src/app/(dashboard)/insights/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingIndicator } from '@/components/common/LoadingComponent';
import {
    AlertTriangle, CheckCircle, Lightbulb, ListChecks, MessageSquareWarning,
    Target, ArrowLeft, FileText, CalendarDays, PlusCircle
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

// Matches the structure of the 'keywordAnalysis' map in your Spring Boot mock
interface KeywordAnalysisData {
  matchedKeywords?: string[];
  missingKeywords?: string[];
  keywordDensityScore?: number;
}

// Matches the structure of the 'analysisResult' map from your backend response
interface AnalysisResultPayload {
  overallMatchScore?: string; // e.g., "67.0%"
  keywordAnalysis?: KeywordAnalysisData;
  resumeSuggestions?: string[]; // This was in service mock
  suggestions?: string[];       // This was in Postman example response
  interviewPreparationTopics?: string[];
  keywordMatches?: string[];    // This was in Postman example response
  missingKeywords?: string[];   // Added to match your code usage below
  overallSentiment?: string;    // This was in Postman example response
  atsScoreRaw?: number;         // This was in Postman example response
  mockProcessingTimestamp?: string;
}

// This is the main data structure for the page, matching Spring Boot's InsightDetailDto
export interface InsightPageData {
  id?: string; 
  insightId?: string;
  jobTitle: string;
  jobDescriptionSummary?: string | null;
  resumeFilename?: string | null;
  matchScore?: number | null;
  analysisResult: AnalysisResultPayload | null;
  analysisDate: string; // ISO string
}

// interface ApiErrorResponse {
//     message: string;
// }

const ListItem: React.FC<{ item: string; icon?: React.ElementType; className?: string }> = ({ 
  item, 
  icon: Icon, 
  className 
}) => (
  <li className={cn("flex items-start space-x-2 py-1.5 text-sm md:text-base", className)}>
    {Icon && <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />}
    <span>{item}</span>
  </li>
);

interface InsightSectionCardProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

const InsightSectionCard: React.FC<InsightSectionCardProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false, 
  badgeText, 
  badgeVariant 
}) => (
  <Card className="overflow-hidden shadow-md dark:border-slate-700">
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : undefined} className="w-full">
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline hover:bg-muted/50 dark:hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="h-6 w-6 text-primary/90" />}
              <span>{title}</span>
            </div>
            {badgeText && <Badge variant={badgeVariant || "secondary"}>{badgeText}</Badge>}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0 pb-6 px-6 text-muted-foreground">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </Card>
);

export default function InsightDetailPage() {
  const router = useRouter();
  const params = useParams();
  // Ensure params is an object and id is a string
  const insightIdFromUrl = params?.id ? String(params.id) : undefined;

  const [insightData, setInsightData] = useState<InsightPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsightDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/insights/detail/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(errorData.message || `Failed to fetch insight details: ${response.statusText}`);
      }
      
      const responseData = await response.json().catch(() => null);
      
      if (!responseData) {
        throw new Error("Received empty or invalid data from API");
      }
      
      setInsightData(responseData as InsightPageData);
    } catch (err: unknown) {
      console.error("Error fetching insight detail:", err);
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (insightIdFromUrl) {
      fetchInsightDetail(insightIdFromUrl);
    } else {
      setError("Insight ID not found in URL.");
      setIsLoading(false);
    }
  }, [insightIdFromUrl, fetchInsightDetail]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e: unknown) { 
      console.error("Error formatting date:", e);
      return dateString; 
    }
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading your insight report..." fullPage={true} />;
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-8 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Failed to Load Insight</h2>
        <p className="text-muted-foreground max-w-md mb-8">{error}</p>
        <Button onClick={() => router.push('/history')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
      </div>
    );
  }

  if (!insightData) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-8 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-3">Insight Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">The requested analysis report could not be found or you may not have permission to view it.</p>
        <Button onClick={() => router.push('/history')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
      </div>
    );
  }

  const { jobTitle, matchScore, analysisResult, analysisDate, resumeFilename } = insightData;
  
  // Safely handle potential nullish values
  const numericScore = matchScore ?? analysisResult?.atsScoreRaw ?? 0;
  const displayScoreString = analysisResult?.overallMatchScore || `${numericScore.toFixed(1)}%`;

  // Safely extract arrays from analysisResult, providing empty arrays as fallbacks
  const matchedKeywords = analysisResult?.keywordAnalysis?.matchedKeywords || 
                          analysisResult?.keywordMatches || 
                          [];
  const missingKeywords = analysisResult?.keywordAnalysis?.missingKeywords || 
                          analysisResult?.missingKeywords || 
                          [];
  const suggestions = analysisResult?.resumeSuggestions || 
                      analysisResult?.suggestions || 
                      [];
  const interviewTopics = analysisResult?.interviewPreparationTopics || [];

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4 md:px-6 lg:px-8 space-y-6 md:space-y-8">
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-2 md:mb-4 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="shadow-xl dark:border-slate-700 overflow-hidden">
        <CardHeader className="bg-muted/30 dark:bg-slate-800/50 p-6 border-b dark:border-slate-700">
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {jobTitle || "Untitled Job Analysis"}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
            {resumeFilename && resumeFilename !== "N/A" && (
              <span className="flex items-center"><FileText className="mr-1.5 h-4 w-4" /> {resumeFilename}</span>
            )}
            <span className="flex items-center">
              <CalendarDays className="mr-1.5 h-4 w-4" /> Analyzed: {formatDate(analysisDate)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Overall Score Section */}
          <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-background rounded-lg">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Overall Match Score
            </p>
            <div className="text-5xl md:text-7xl font-extrabold text-primary my-2">
              {displayScoreString}
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, numericScore))} 
              className="w-3/4 md:w-1/2 mx-auto h-2.5 my-4" 
            />
            {analysisResult?.overallSentiment && (
              <Badge 
                variant={numericScore > 75 ? "default" : numericScore > 50 ? "secondary" : "destructive"} 
                className="text-sm"
              >
                {analysisResult.overallSentiment}
              </Badge>
            )}
          </div>

          <Separator className="my-6" />

          {/* Sections using Accordion */}
          <InsightSectionCard 
            title="Keyword Analysis" 
            icon={ListChecks} 
            defaultOpen={true} 
            badgeText={analysisResult?.keywordAnalysis?.keywordDensityScore 
              ? `${analysisResult.keywordAnalysis.keywordDensityScore}% Density` 
              : undefined}
          >
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h4 className="font-semibold text-md mb-2 text-green-600 dark:text-green-400">
                  Matched Keywords
                </h4>
                {matchedKeywords.length > 0 ? (
                  <ul className="space-y-1">
                    {matchedKeywords.map((keyword, index) => (
                      <ListItem key={`match-${index}`} item={keyword} icon={CheckCircle} />
                    ))}
                  </ul>
                ) : <p className="text-sm">No specific keyword matches highlighted.</p>}
              </div>
              <div>
                <h4 className="font-semibold text-md mb-2 text-amber-600 dark:text-amber-400">
                  Keywords to Consider
                </h4>
                {missingKeywords.length > 0 ? (
                  <ul className="space-y-1">
                    {missingKeywords.map((keyword, index) => (
                      <ListItem key={`miss-${index}`} item={keyword} icon={MessageSquareWarning} />
                    ))}
                  </ul>
                ) : <p className="text-sm">No critical missing keywords identified.</p>}
              </div>
            </div>
          </InsightSectionCard>

          {suggestions.length > 0 && (
            <InsightSectionCard title="Resume & JD Suggestions" icon={Lightbulb} defaultOpen={true}>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <ListItem key={`sug-${index}`} item={suggestion} icon={Lightbulb} />
                ))}
              </ul>
            </InsightSectionCard>
          )}

          {interviewTopics.length > 0 && (
            <InsightSectionCard title="Interview Preparation Focus" icon={Target}>
              <ul className="space-y-2">
                {interviewTopics.map((topic, index) => (
                  <ListItem key={`prep-${index}`} item={topic} icon={CheckCircle} />
                ))}
              </ul>
            </InsightSectionCard>
          )}

          {/* Raw Analysis Result (for debugging or full detail) - Optional */}
          {process.env.NODE_ENV === 'development' && analysisResult && (
            <InsightSectionCard title="Raw Analysis Data (Dev Only)" icon={AlertTriangle}>
              <pre className="text-xs bg-muted/50 dark:bg-slate-800 p-4 rounded-md overflow-x-auto max-h-96">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </InsightSectionCard>
          )}

        </CardContent>
        <CardFooter className="mt-6 p-6 border-t dark:border-slate-700 flex justify-center print:hidden">
            <Button onClick={() => router.push('/analyze')} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Analyze Another JD
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}