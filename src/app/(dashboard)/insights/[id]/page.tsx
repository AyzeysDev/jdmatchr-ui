// src/app/(dashboard)/insights/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { LoadingIndicator } from '@/components/common/LoadingComponent';
import {
    AlertTriangle,
    ArrowLeft,
    FileText,
    CalendarDays,
    PlusCircle,
    BookOpen,
    Link2,
    Check, // Added Check icon import
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    Tooltip as RechartsTooltip,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@/components/ui/chart";

// --- Updated TypeScript Interfaces to match the new backend JSON structure ---
interface FluffDetectedItem {
  original: string;
  suggestion: string;
}

interface FluffAnalysisPayload {
  detected?: FluffDetectedItem[];
  summary?: string;
}

interface JDSummaryPayload {
  summary?: string;
  responsibilities?: string[];
  requiredQualifications?: string[];
  tone?: string;
}

interface RoleFitPredictionPayload {
  verdict?: string;
  reason?: string;
}

interface RadarDataPayload {
  technicalSkills?: number;
  softSkills?: number;
  experienceLevel?: number;
  cultureFit?: number;
  // locationFit?: number; // Optional
}

interface AlignmentBreakdownPayload {
  skills?: number;
  experience?: number;
  education?: number;
  keywords?: number;
}

interface RoleFitAndAlignmentMetricsPayload {
  prediction?: RoleFitPredictionPayload;
  radarData?: RadarDataPayload;
  alignmentBreakdown?: AlignmentBreakdownPayload;
}

interface KeywordAnalysisPayload {
  missingKeywords?: string[];
  keywordDensityScore?: number;
  matchedKeywords?: string[];
}

interface AnalysisResultPayload {
  mockProcessingTimestamp?: string;
  jdSummary?: JDSummaryPayload;
  fluffAnalysis?: FluffAnalysisPayload;
  roleFitAndAlignmentMetrics?: RoleFitAndAlignmentMetricsPayload;
  keywordAnalysis?: KeywordAnalysisPayload;
  resumeSuggestions?: string[];
  interviewPreparationTopics?: string[];
  // overallSentiment?: string; // Optional
}

export interface InsightPageData {
  id: string;
  jobTitle: string;
  resumeFilename?: string | null;
  createdAt: string;
  matchScore: number;
  atsScore: number;
  analysisResult: AnalysisResultPayload | null; // analysisResult can still be null if the entire object is missing
}
// --- End of Updated TypeScript Interfaces ---

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

const getScoreTextFillClass = (score: number): string => {
  if (score >= 90) return "fill-green-700 dark:fill-green-500";
  if (score >= 80) return "fill-green-600 dark:fill-green-400";
  if (score >= 60) return "fill-orange-500 dark:fill-orange-400";
  if (score >= 40) return "fill-yellow-500 dark:fill-yellow-400";
  return "fill-red-600 dark:fill-red-500";
};

const getScoreBarFillColor = (score: number): string => {
  if (score >= 90) return "hsl(120, 60%, 35%)"; // Dark Green
  if (score >= 80) return "hsl(120, 60%, 45%)"; // Green
  if (score >= 60) return "hsl(39, 90%, 50%)";  // Orange
  if (score >= 40) return "hsl(54, 90%, 50%)";  // Yellow
  return "hsl(0, 70%, 50%)";                     // Red
};

interface ScoreRadialChartProps {
  score: number;
  label: string;
  title: string;
  chartConfig: ChartConfig;
}

const ScoreRadialChart: React.FC<ScoreRadialChartProps> = ({ score, label, title, chartConfig }) => {
  const barFillColor = getScoreBarFillColor(score);
  // Ensure the data object has the 'fill' property for the RadialBar to pick up
  const chartData = [{ name: title, value: score, fill: barFillColor }];

  const dynamicChartConfig: ChartConfig = {
    ...chartConfig,
    [label]: { label: title, color: barFillColor },
  };
  const scoreTextFillClass = getScoreTextFillClass(score);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer config={dynamicChartConfig} className="mx-auto aspect-square w-full h-full">
        <RadialBarChart data={chartData} startAngle={90} endAngle={-270} innerRadius="70%" outerRadius="100%" barSize={12} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))", opacity: 0.4 }} cornerRadius={6} isAnimationActive={false} />
          {/* The fill for RadialBar is now sourced from chartData[0].fill */}
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={cn("text-3xl font-bold", scoreTextFillClass)}>
            {score}
          </text>
          <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" indicator="line" />} />
        </RadialBarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};

interface RoleFitRadarChartProps {
  data: Array<{ subject: string; value: number; fullMark: number }>;
  chartConfig: ChartConfig;
  radarColor: string;
}
const RoleFitRadarChart: React.FC<RoleFitRadarChartProps> = ({ data, chartConfig, radarColor }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full h-full">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 0, left: 30 }}>
          <ChartTooltip content={<ChartTooltipContent className="text-xs" />} />
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} tick={{ fontSize: 8 }} />
          <Radar name="Fit Score" dataKey="value" stroke={radarColor} fill={radarColor} fillOpacity={0.6} isAnimationActive={false}/>
        </RadarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};

export default function InsightDetailPage() {
  const router = useRouter();
  const params = useParams();
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
      const data: InsightPageData = await response.json();
      if (!data || !data.analysisResult) { // Check for analysisResult specifically
        console.error("Incomplete data received from API:", data);
        throw new Error("Received incomplete or invalid data from API");
      }
      setInsightData(data);
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

  if (isLoading) {
    return <LoadingIndicator message="Loading your insight report..." fullPage={true} />;
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full">
        <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Failed to Load Insight</h2>
        <p className="text-muted-foreground max-w-md mb-8">{error}</p>
        <Button onClick={() => router.push('/history')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
      </div>
    );
  }
  if (!insightData || !insightData.analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full">
        <FileText className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-3">Insight Data Incomplete</h2>
        <p className="text-muted-foreground max-w-md mb-8">The requested report data is incomplete or could not be found.</p>
        <Button onClick={() => router.push('/history')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
      </div>
    );
  }

  // Destructure with new top-level field names
  // Removed 'id' from destructuring as it's not used in the rendering logic below
  const { jobTitle, resumeFilename, createdAt, matchScore, atsScore, analysisResult } = insightData;

  // Access nested data safely
  const fluffAnalysis = analysisResult.fluffAnalysis;
  const fluffyPhrasesCount = fluffAnalysis?.detected?.length ?? 0;
  const hasFluff = fluffyPhrasesCount > 0;

  const alignmentBreakdown = analysisResult.roleFitAndAlignmentMetrics?.alignmentBreakdown ?? {
    skills: 0, experience: 0, education: 0, keywords: 0,
  };
   const progressBarColors = [
    "[&>[data-slot=progress-indicator]]:bg-sky-500",
    "[&>[data-slot=progress-indicator]]:bg-emerald-500",
    "[&>[data-slot=progress-indicator]]:bg-amber-500",
    "[&>[data-slot=progress-indicator]]:bg-rose-500",
  ];

  const radarMetrics = analysisResult.roleFitAndAlignmentMetrics?.radarData;
  const roleFitData = [
    { subject: 'Tech Skills', value: radarMetrics?.technicalSkills ?? 0, fullMark: 100 },
    { subject: 'Soft Skills', value: radarMetrics?.softSkills ?? 0, fullMark: 100 },
    { subject: 'Experience', value: radarMetrics?.experienceLevel ?? 0, fullMark: 100 },
    { subject: 'Culture Fit', value: radarMetrics?.cultureFit ?? 0, fullMark: 100 },
  ].filter(item => item.value > 0 || Object.keys(radarMetrics || {}).length === 0);

  const scoreChartConfigBase = {} satisfies ChartConfig;

  const roleFitRadarChartColor = "hsl(var(--chart-3))";
  const roleFitChartConfig = {
    value: { label: "Score", color: roleFitRadarChartColor },
    "tech skills": { label: "Tech Skills", color: roleFitRadarChartColor },
    "soft skills": { label: "Soft Skills", color: roleFitRadarChartColor },
    "experience": { label: "Experience", color: roleFitRadarChartColor },
    "culture fit": { label: "Culture Fit", color: roleFitRadarChartColor },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-2 print:hidden">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {jobTitle || "Analysis Report"}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            {resumeFilename && resumeFilename !== "N/A" && (
              <span className="flex items-center"><FileText className="mr-1.5 h-4 w-4" /> {resumeFilename}</span>
            )}
            <span className="flex items-center">
              <CalendarDays className="mr-1.5 h-4 w-4" /> Analyzed: {formatDate(createdAt)}
            </span>
          </div>
        </div>
        <Button onClick={() => router.push('/analyze')} size="default" className="print:hidden shrink-0">
            <PlusCircle className="mr-2 h-5 w-5" /> Analyze Another JD
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">Match Score</CardTitle>
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-2">
            <div className="w-full max-w-[180px] sm:max-w-[200px] h-full max-h-[180px] sm:max-h-[200px]">
              <ScoreRadialChart score={matchScore} label="match-score" title="Match Score" chartConfig={scoreChartConfigBase} />
            </div>
          </div>
          <CardDescription className="mt-2 text-xs sm:text-sm shrink-0">
            Your resumes alignment with the JD.
          </CardDescription>
        </Card>

        <Card className="flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">ATS Score</CardTitle>
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-2">
            <div className="w-full max-w-[180px] sm:max-w-[200px] h-full max-h-[180px] sm:max-h-[200px]">
              <ScoreRadialChart score={atsScore} label="ats-score" title="ATS Score" chartConfig={scoreChartConfigBase} />
            </div>
          </div>
          <CardDescription className="mt-2 text-xs sm:text-sm shrink-0">
            Estimated Applicant Tracking System score.
          </CardDescription>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-3 shrink-0">Fluffy Detector</CardTitle>
          <div className="flex flex-col items-center justify-center flex-grow">
            {hasFluff ? (
              <>
                <AlertTriangle className="h-12 sm:h-16 w-12 sm:w-16 mb-3 sm:mb-4 text-amber-500" />
                <p className="text-lg sm:text-xl font-semibold text-amber-600 dark:text-amber-400">
                  {fluffyPhrasesCount} instance{fluffyPhrasesCount !== 1 && 's'} detected
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 px-2">
                    {fluffAnalysis?.summary || "Phrases with filler language found."}
                </p>
              </>
            ) : (
              <>
                <Check className="h-12 sm:h-16 w-12 sm:w-16 mb-3 sm:mb-4 text-green-500" />
                <p className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400">Looking Good!</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {fluffAnalysis?.summary || "No significant filler language detected."}
                </p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 min-h-[240px] sm:min-h-[280px] flex flex-col">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary"/> JD Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {analysisResult.jdSummary?.summary || "Job description summary not available."}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6 min-h-[240px] sm:min-h-[280px] flex flex-col">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
                <Link2 className="mr-2 h-5 w-5 text-primary"/> JD-Resume Alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 flex-grow">
            {Object.entries(alignmentBreakdown).map(([key, value], index) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs sm:text-sm font-medium capitalize text-foreground">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{value || 0}%</span>
                </div>
                <Progress value={value || 0} aria-label={`${key} alignment score`} className={progressBarColors[index % progressBarColors.length]} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">Role Fit Prediction</CardTitle>
          {analysisResult.roleFitAndAlignmentMetrics?.prediction?.verdict && (
            <div className={cn("mb-2 text-lg font-semibold", analysisResult.roleFitAndAlignmentMetrics.prediction.verdict.toLowerCase().includes("strong") ? "text-green-600" : analysisResult.roleFitAndAlignmentMetrics.prediction.verdict.toLowerCase().includes("moderate") ? "text-orange-500" : "text-red-500")}>
                {analysisResult.roleFitAndAlignmentMetrics.prediction.verdict}
            </div>
          )}
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-1">
            <div className="w-full max-w-[220px] sm:max-w-[250px] h-full max-h-[180px] sm:max-h-[200px]">
              {roleFitData.length > 0 ? (
                <RoleFitRadarChart data={roleFitData} chartConfig={roleFitChartConfig} radarColor={roleFitRadarChartColor} />
              ) : <p className="text-xs text-muted-foreground">Not enough data for role fit graph.</p>}
            </div>
          </div>
          {analysisResult.roleFitAndAlignmentMetrics?.prediction?.reason && (
            <CardDescription className="mt-2 text-xs sm:text-sm shrink-0 px-2">
                {analysisResult.roleFitAndAlignmentMetrics.prediction.reason}
            </CardDescription>
          )}
        </Card>
      </div>

       <div className="mt-8 space-y-6">
            {analysisResult.keywordAnalysis && (analysisResult.keywordAnalysis.matchedKeywords?.length || analysisResult.keywordAnalysis.missingKeywords?.length) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Detailed Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs sm:text-sm">
                        <p className="text-muted-foreground">Matched: {analysisResult.keywordAnalysis.matchedKeywords?.join(', ') || 'None'}</p>
                        <p className="text-muted-foreground mt-2">Consider Adding: {analysisResult.keywordAnalysis.missingKeywords?.join(', ') || 'None'}</p>
                    </CardContent>
                </Card>
            )}
            {analysisResult.resumeSuggestions && analysisResult.resumeSuggestions.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Resume Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
                            {analysisResult.resumeSuggestions.map((s, i) => <li key={`sug-${i}`}>{s}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
             {analysisResult.interviewPreparationTopics && analysisResult.interviewPreparationTopics.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Interview Preparation Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
                            {analysisResult.interviewPreparationTopics.map((s, i) => <li key={`topic-${i}`}>{s}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}
