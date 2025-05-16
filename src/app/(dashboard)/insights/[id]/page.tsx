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
    ChartContainer,
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
    skills?: number; // 0-100
    experience?: number; // 0-100
    education?: number; // 0-100
    keywords?: number; // 0-100
  };
  roleFitPredictionData?: { // For Radar Chart
    technicalSkills?: number; // 0-100
    softSkills?: number; // 0-100
    experienceLevel?: number; // 0-100
    cultureFit?: number; // 0-100
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
  label: string;
  title: string;
  color: string;
  chartConfig: ChartConfig;
}

const ScoreRadialChart: React.FC<ScoreRadialChartProps> = ({ score, label, title, color, chartConfig }) => {
  const chartData = [{ name: title, value: score, fill: color }];
  const dynamicChartConfig: ChartConfig = {
    ...chartConfig,
    [label]: {
      label: title,
      color: color,
    },
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer
        config={dynamicChartConfig}
        className="mx-auto aspect-square w-full h-full"
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
  chartConfig: ChartConfig;
}
const RoleFitRadarChart: React.FC<RoleFitRadarChartProps> = ({ data, chartConfig }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full h-full"
      >
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 0, left: 30 }}>
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
      // This div will be centered by the <main> tag's flex properties if it's a direct child
      // or by its own `mx-auto` if it's within a full-width block.
      // For full page states, it's common to let the <main> tag center it.
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
  if (!insightData) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full">
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
    // Removed container, max-w-6xl, and py-6. Padding is now handled by the <main> tag in layout.
    // This div will take the width of its parent <main> and allow content to flow.
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
              <CalendarDays className="mr-1.5 h-4 w-4" /> Analyzed: {formatDate(analysisDate)}
            </span>
          </div>
        </div>
        <Button onClick={() => router.push('/analyze')} size="default" className="print:hidden shrink-0">
            <PlusCircle className="mr-2 h-5 w-5" /> Analyze Another JD
        </Button>
      </div>

      {/* Main Grid for Dashboard Cards - This grid will expand to the width of its parent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for Match Score */}
        <Card className="flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">Match Score</CardTitle>
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-2">
            <div className="w-full max-w-[180px] sm:max-w-[200px] h-full max-h-[180px] sm:max-h-[200px]">
              <ScoreRadialChart score={displayMatchScore} label="match-score" title="Match Score" color="hsl(var(--chart-1))" chartConfig={scoreChartConfigBase} />
            </div>
          </div>
          <CardDescription className="mt-2 text-xs sm:text-sm shrink-0">
            Your resumes alignment with the JD.
          </CardDescription>
        </Card>

        {/* Card for ATS Score */}
        <Card className="flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">ATS Score</CardTitle>
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-2">
            <div className="w-full max-w-[180px] sm:max-w-[200px] h-full max-h-[180px] sm:max-h-[200px]">
              <ScoreRadialChart score={atsScore} label="ats-score" title="ATS Score" color="hsl(var(--chart-2))" chartConfig={scoreChartConfigBase} />
            </div>
          </div>
          <CardDescription className="mt-2 text-xs sm:text-sm shrink-0">
            Estimated Applicant Tracking System score.
          </CardDescription>
        </Card>

        {/* Card for Fluffy Detector */}
        <Card className="flex flex-col items-center justify-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-3 shrink-0">Fluffy Detector</CardTitle>
          <div className="flex flex-col items-center justify-center flex-grow">
            <AlertTriangle className={cn("h-12 sm:h-16 w-12 sm:w-16 mb-3 sm:mb-4", hasFluff ? "text-amber-500" : "text-green-500")} />
            {hasFluff ? (
              <>
                <p className="text-lg sm:text-xl font-semibold text-amber-600 dark:text-amber-400">
                  {fluffyPhrasesCount} instance{fluffyPhrasesCount !== 1 && 's'} detected
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Phrases with filler language found.</p>
                <Button variant="link" size="sm" className="mt-2 sm:mt-3 text-primary text-xs sm:text-sm">
                  Review Suggestions (Placeholder)
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400">Looking Good!</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">No significant filler language detected.</p>
              </>
            )}
          </div>
        </Card>

        {/* Card for JD Analysis Summary */}
        <Card className="p-4 sm:p-6 min-h-[240px] sm:min-h-[280px] flex flex-col">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary"/> JD Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {insightData.jobDescriptionSummary || analysisResult?.jobDescriptionSummary || "No summary available. The job description emphasizes key skills in project management, communication, and problem-solving. Ideal candidates should have at least 5 years of experience in similar roles."}
            </p>
          </CardContent>
        </Card>

        {/* Card for JD-Resume Alignment */}
        <Card className="p-4 sm:p-6 min-h-[240px] sm:min-h-[280px] flex flex-col">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
                <Link2 className="mr-2 h-5 w-5 text-primary"/> JD-Resume Alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 flex-grow">
            {Object.entries(alignmentScores).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs sm:text-sm font-medium capitalize text-foreground">{key}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value} aria-label={`${key} alignment score`} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card for Role Fit Prediction */}
        <Card className="flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">Role Fit Prediction</CardTitle>
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-2">
            <div className="w-full max-w-[220px] sm:max-w-[250px] h-full max-h-[200px] sm:max-h-[220px]">
              <RoleFitRadarChart data={roleFitData} chartConfig={roleFitChartConfig} />
            </div>
          </div>
          <CardDescription className="mt-2 text-xs sm:text-sm shrink-0">
            Likelihood of alignment with the role.
          </CardDescription>
        </Card>
      </div>

       {/* Optional Detailed Sections */}
       <div className="mt-8 space-y-6">
            {(analysisResult?.keywordAnalysis?.matchedKeywords?.length || analysisResult?.keywordAnalysis?.missingKeywords?.length) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Detailed Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs sm:text-sm">
                        <p className="text-muted-foreground">Matched: {analysisResult?.keywordAnalysis?.matchedKeywords?.join(', ') || 'None'}</p>
                        <p className="text-muted-foreground mt-2">Consider Adding: {analysisResult?.keywordAnalysis?.missingKeywords?.join(', ') || 'None'}</p>
                    </CardContent>
                </Card>
            )}
            {analysisResult?.suggestions && analysisResult.suggestions.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Resume & JD Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
                            {analysisResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}
