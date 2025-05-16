// src/app/(dashboard)/insights/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { LoadingIndicator } from '@/components/common/LoadingComponent';
import {
    AlertTriangle, // For Fluffy Detector
    ArrowLeft,
    FileText,
    CalendarDays,
    PlusCircle,
    BookOpen, // For JD Analysis Summary
    Link2, // For JD-Resume Alignment
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
    ChartContainer, // This is used
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@/components/ui/chart";

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
  resumeSuggestions?: string[];
  suggestions?: string[];
  interviewPreparationTopics?: string[];
  keywordMatches?: string[];
  missingKeywords?: string[];
  overallSentiment?: string;
  atsScoreRaw?: number;         // e.g. 76
  mockProcessingTimestamp?: string;
  fluffyPhrasesCount?: number;
  fluffyPhrasesExamples?: string[];
  alignmentScores?: {
    skills?: number;
    experience?: number;
    education?: number;
    keywords?: number;
  };
  roleFitPredictionData?: {
    technicalSkills?: number;
    softSkills?: number;
    experienceLevel?: number;
    cultureFit?: number;
  };
  jobDescriptionSummary?: string;
}

// This is the main data structure for the page
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


// --- Helper Function to Format Date ---
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

// --- Radial Chart Component for Scores ---
interface ScoreRadialChartProps {
  score: number;
  label: string; // Unique key for chartConfig, e.g., "match-score"
  title: string; // Display title for tooltip, e.g., "Match Score"
  color: string; // CSS variable string, e.g., "hsl(var(--chart-1))"
  chartConfig: ChartConfig; // Base config, will be extended
}

const ScoreRadialChart: React.FC<ScoreRadialChartProps> = ({ score, label, title, color, chartConfig }) => {
  const chartData = [{ name: title, value: score, fill: color }];
  // Extend the passed chartConfig with the specific entry for this chart instance
  const dynamicChartConfig: ChartConfig = {
    ...chartConfig, // Spread the base config
    [label]: {       // Add/override the specific entry for this chart's data series
      label: title,  // Label for tooltip
      color: color,  // Color (can be a CSS var string)
    },
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* ChartContainer uses dynamicChartConfig to provide context for tooltips */}
      <ChartContainer
        config={dynamicChartConfig}
        className="mx-auto aspect-square w-full h-full" // Ensure it fills ResponsiveContainer
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={-270}
          innerRadius="70%"
          outerRadius="100%"
          barSize={12}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar
            dataKey="value"
            background={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            cornerRadius={6}
            // The 'fill' for RadialBar is taken from the data's 'fill' property (chartData[0].fill)
          />
          <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-3xl font-bold"
          >
              {score}
          </text>
          {/* RechartsTooltip uses context from ChartContainer, configured by dynamicChartConfig */}
          <RechartsTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" indicator="line" />}
          />
        </RadialBarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};


// --- Radar Chart Component for Role Fit ---
interface RoleFitRadarChartProps {
  data: Array<{ subject: string; value: number; fullMark: number }>;
  chartConfig: ChartConfig; // This config will be passed to ChartContainer
}
const RoleFitRadarChart: React.FC<RoleFitRadarChartProps> = ({ data, chartConfig }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* Added ChartContainer here and passed the chartConfig prop */}
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full h-full"
      >
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 0, left: 30 }}>
          {/* ChartTooltip will now use the config from ChartContainer */}
          <ChartTooltip content={<ChartTooltipContent hideLabel className="text-xs" />} />
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} tick={{ fontSize: 8 }} />
          <Radar
            name="Role Fit"
            dataKey="value"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.6}
          />
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
  }, []); // Removed router from dependency array as it's not directly used in this callback

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
        <p className="text-muted-foreground max-w-md mb-8">The requested report could not be found.</p>
        <Button onClick={() => router.push('/history')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
      </div>
    );
  }

  const { jobTitle, matchScore, analysisResult, analysisDate, resumeFilename } = insightData;
  const atsScore = analysisResult?.atsScoreRaw ?? 0;
  const displayMatchScore = matchScore ?? 0;
  const fluffyPhrasesCount = analysisResult?.fluffyPhrasesCount ?? 3;
  const hasFluff = fluffyPhrasesCount > 0;

  const alignmentScores = analysisResult?.alignmentScores ?? {
    skills: Math.floor(Math.random() * 50) + 50,
    experience: Math.floor(Math.random() * 50) + 40,
    education: Math.floor(Math.random() * 40) + 60,
    keywords: Math.floor(Math.random() * 60) + 40,
  };

  const roleFitData = [
    { subject: 'Tech Skills', value: analysisResult?.roleFitPredictionData?.technicalSkills ?? Math.floor(Math.random() * 30) + 70, fullMark: 100 },
    { subject: 'Soft Skills', value: analysisResult?.roleFitPredictionData?.softSkills ?? Math.floor(Math.random() * 40) + 55, fullMark: 100 },
    { subject: 'Experience', value: analysisResult?.roleFitPredictionData?.experienceLevel ?? Math.floor(Math.random() * 35) + 60, fullMark: 100 },
    { subject: 'Culture Fit', value: analysisResult?.roleFitPredictionData?.cultureFit ?? Math.floor(Math.random() * 50) + 50, fullMark: 100 },
  ];

  const scoreChartConfigBase = {} satisfies ChartConfig;

  const roleFitChartConfig = {
    value: { label: "Score", color: "hsl(var(--chart-1))" },
    "tech skills": { label: "Tech Skills", color: "hsl(var(--chart-1))" },
    "soft skills": { label: "Soft Skills", color: "hsl(var(--chart-1))" },
    "experience": { label: "Experience", color: "hsl(var(--chart-1))" },
    "culture fit": { label: "Culture Fit", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4 md:px-6 lg:px-8 space-y-6">
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
              <CalendarDays className="mr-1.5 h-4 w-4" /> Analyzed: {formatDate(analysisDate)}
            </span>
          </div>
        </div>
        <Button onClick={() => router.push('/analyze')} size="default" className="print:hidden shrink-0">
            <PlusCircle className="mr-2 h-5 w-5" /> Analyze Another JD
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-between text-center p-6 min-h-[300px] sm:min-h-[320px]">
          <CardTitle className="text-lg font-semibold mb-2">Match Score</CardTitle>
          <div className="w-full h-[200px]">
            <ScoreRadialChart score={displayMatchScore} label="match-score" title="Match Score" color="hsl(var(--chart-1))" chartConfig={scoreChartConfigBase} />
          </div>
           <CardDescription className="mt-2 text-sm">
            Your resumes alignment with the JD.
          </CardDescription>
        </Card>

        <Card className="flex flex-col items-center justify-between text-center p-6 min-h-[300px] sm:min-h-[320px]">
          <CardTitle className="text-lg font-semibold mb-2">ATS Score</CardTitle>
           <div className="w-full h-[200px]">
            <ScoreRadialChart score={atsScore} label="ats-score" title="ATS Score" color="hsl(var(--chart-2))" chartConfig={scoreChartConfigBase} />
          </div>
           <CardDescription className="mt-2 text-sm">
            Estimated Applicant Tracking System score.
          </CardDescription>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-6 min-h-[300px] sm:min-h-[320px]">
          <CardTitle className="text-lg font-semibold mb-3">Fluffy Detector</CardTitle>
          <div className="flex flex-col items-center justify-center flex-grow">
            <AlertTriangle className={cn("h-16 w-16 mb-4", hasFluff ? "text-amber-500" : "text-green-500")} />
            {hasFluff ? (
              <>
                <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                  {fluffyPhrasesCount} instance{fluffyPhrasesCount !== 1 && 's'} detected
                </p>
                <p className="text-sm text-muted-foreground mt-1">Phrases with filler language found.</p>
                <Button variant="link" size="sm" className="mt-3 text-primary">
                  Review Suggestions (Placeholder)
                </Button>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">Looking Good!</p>
                <p className="text-sm text-muted-foreground mt-1">No significant filler language detected.</p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6 min-h-[280px] flex flex-col">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-lg font-semibold flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary"/> JD Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insightData.jobDescriptionSummary || analysisResult?.jobDescriptionSummary || "No summary available. The job description emphasizes key skills in project management, communication, and problem-solving. Ideal candidates should have at least 5 years of experience in similar roles."}
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 min-h-[280px] flex flex-col">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
                <Link2 className="mr-2 h-5 w-5 text-primary"/> JD-Resume Alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 flex-grow">
            {Object.entries(alignmentScores).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium capitalize text-foreground">{key}</span>
                  <span className="text-sm text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value} aria-label={`${key} alignment score`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-between text-center p-6 min-h-[300px] sm:min-h-[320px]">
          <CardTitle className="text-lg font-semibold mb-2">Role Fit Prediction</CardTitle>
          <div className="w-full h-[200px] sm:h-[220px]">
            <RoleFitRadarChart data={roleFitData} chartConfig={roleFitChartConfig} />
          </div>
          <CardDescription className="mt-2 text-sm">
            Likelihood of alignment with the role based on multiple factors.
          </CardDescription>
        </Card>
      </div>

       <div className="mt-8 space-y-6">
            {(analysisResult?.keywordAnalysis?.matchedKeywords?.length || analysisResult?.keywordAnalysis?.missingKeywords?.length) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Matched: {analysisResult?.keywordAnalysis?.matchedKeywords?.join(', ') || 'None'}</p>
                        <p className="text-sm text-muted-foreground mt-2">Consider Adding: {analysisResult?.keywordAnalysis?.missingKeywords?.join(', ') || 'None'}</p>
                    </CardContent>
                </Card>
            )}
            {analysisResult?.suggestions && analysisResult.suggestions.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Resume & JD Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            {analysisResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}
