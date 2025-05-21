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
    Link2, 
    Check,
    // ChevronDown, // As per user's last code
    UserCheck, // Re-added for Role Fit Card title
    SearchCheck,
    Tags, 
    Lightbulb, 
    ClipboardCheck, 
    CheckCircle2, 
    Zap, 
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge"; 
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

// --- TypeScript Interfaces (remain unchanged from your provided code) ---
interface FluffDetectedItem {
  original: string;
  suggestion: string;
}

interface FluffAnalysisPayload {
  detected?: FluffDetectedItem[];
  summary?: string;
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
  matchScore: number;
  atsScore: number;
  mockProcessingTimestamp?: string;
  fluffAnalysis?: FluffAnalysisPayload;
  roleFitAndAlignmentMetrics?: RoleFitAndAlignmentMetricsPayload;
  keywordAnalysis?: KeywordAnalysisPayload;
  resumeSuggestions?: string[];
  interviewPreparationTopics?: string[];
}

export interface InsightPageData {
  id: string;
  jobTitle: string;
  resumeFilename?: string | null;
  createdAt: string;
  analysisResult: AnalysisResultPayload | null;
}
// --- End of TypeScript Interfaces ---

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
  if (score >= 90) return "hsl(120, 60%, 35%)";
  if (score >= 80) return "hsl(120, 60%, 45%)";
  if (score >= 60) return "hsl(39, 90%, 50%)";
  if (score >= 40) return "hsl(54, 90%, 50%)";
  return "hsl(0, 70%, 50%)";
};

interface ScoreRadialChartProps {
  score: number;
  label: string;
  title: string;
  chartConfig: ChartConfig;
}

const ScoreRadialChart: React.FC<ScoreRadialChartProps> = ({ score, label, title, chartConfig }) => {
  const barFillColor = getScoreBarFillColor(score);
  const chartData = [{ name: title, value: score, fill: barFillColor }];
  const dynamicChartConfig: ChartConfig = { ...chartConfig, [label]: { label: title, color: barFillColor } };
  const scoreTextFillClass = getScoreTextFillClass(score);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer config={dynamicChartConfig} className="mx-auto aspect-square w-full h-full">
        <RadialBarChart data={chartData} startAngle={90} endAngle={-270} innerRadius="70%" outerRadius="100%" barSize={12} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))", opacity: 0.4 }} cornerRadius={6} isAnimationActive={false} />
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
      if (!data || !data.analysisResult) {
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

  if (isLoading) return <LoadingIndicator message="Loading your insight report..." fullPage={true} />;
  if (error) return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h2 className="text-2xl font-semibold text-destructive mb-3">Failed to Load Insight</h2>
      <p className="text-muted-foreground max-w-md mb-8">{error}</p>
      <Button onClick={() => router.push('/history')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
      </Button>
    </div>
  );
  if (!insightData || !insightData.analysisResult) return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <FileText className="w-16 h-16 text-muted-foreground mb-6" />
      <h2 className="text-2xl font-semibold text-foreground mb-3">Insight Data Incomplete</h2>
      <p className="text-muted-foreground max-w-md mb-8">The requested report data is incomplete or could not be found.</p>
      <Button onClick={() => router.push('/history')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
      </Button>
    </div>
  );

  const { jobTitle, resumeFilename, createdAt, analysisResult } = insightData;
  const { matchScore, atsScore, fluffAnalysis, roleFitAndAlignmentMetrics, keywordAnalysis, resumeSuggestions, interviewPreparationTopics } = analysisResult;
  const fluffyPhrasesCount = fluffAnalysis?.detected?.length ?? 0;
  const hasFluff = fluffyPhrasesCount > 0;
  const alignmentBreakdown = roleFitAndAlignmentMetrics?.alignmentBreakdown ?? { skills: 0, experience: 0, education: 0, keywords: 0 };
  const progressBarColors = [
    "[&>[data-slot=progress-indicator]]:bg-sky-500",
    "[&>[data-slot=progress-indicator]]:bg-emerald-500",
    "[&>[data-slot=progress-indicator]]:bg-amber-500",
    "[&>[data-slot=progress-indicator]]:bg-rose-500",
  ];
  const radarMetrics = roleFitAndAlignmentMetrics?.radarData;
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

      {/* First Row of Cards - Match Score, ATS Score, JD-Resume Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className={cn(
            "flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]",
            "bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-30 dark:from-blue-300/70 dark:via-cyan-600/60 dark:to-teal-900/50",
            "shadow-lg hover:shadow-xl transition-shadow"
        )}>
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">Match Score</CardTitle>
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-2">
            <div className="w-full max-w-[180px] sm:max-w-[200px] h-full max-h-[180px] sm:max-h-[200px]">
              <ScoreRadialChart score={matchScore} label="match-score" title="Match Score" chartConfig={scoreChartConfigBase} />
            </div>
          </div>
          <CardDescription className="mt-2 text-xs sm:text-sm shrink-0">Your resumes alignment with the JD.</CardDescription>
        </Card>

        <Card className={cn(
            "flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]",
            "bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-30 dark:from-violet-300/70 dark:via-purple-600/60 dark:to-fuchsia-900/50",
            "shadow-lg hover:shadow-xl transition-shadow"
        )}>
          <CardTitle className="text-base sm:text-lg font-semibold mb-2 shrink-0">ATS Score</CardTitle>
          <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-2">
            <div className="w-full max-w-[180px] sm:max-w-[200px] h-full max-h-[180px] sm:max-h-[200px]">
              <ScoreRadialChart score={atsScore} label="ats-score" title="ATS Score" chartConfig={scoreChartConfigBase} />
            </div>
          </div>
          <CardDescription className="mt-2 text-xs sm:text-sm shrink-0">Estimated Applicant Tracking System score.</CardDescription>
        </Card>
        
        <Card className={cn(
            "p-4 sm:p-6 min-h-[280px] sm:min-h-[320px] flex flex-col",
            "bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-100 dark:from-slate-800/90 dark:via-gray-800/80 dark:to-neutral-800/70",
            "shadow-lg hover:shadow-xl transition-shadow"
        )}>
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
      </div>

      {/* Second Row of Cards - Role Fit Prediction, Fluffy Detector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={cn(
    "flex flex-col items-center text-center p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]",
    "bg-gradient-to-r from-purple-100 via-fuchsia-50 to-pink-100 dark:from-purple-900/40 dark:via-fuchsia-900/30 dark:to-pink-900/30",
    "border border-purple-200/60 dark:border-purple-800/30",
    "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300"
)}>
          <CardHeader className="p-0 mb-3 flex flex-col items-center w-full">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
              <UserCheck className="mr-2 h-5 w-5 text-primary"/>
              Role Fit Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center justify-center flex-grow w-full">
            {roleFitAndAlignmentMetrics?.prediction?.verdict && (
              <div className={cn("mb-1 text-lg font-semibold", roleFitAndAlignmentMetrics.prediction.verdict.toLowerCase().includes("strong") ? "text-green-600" : roleFitAndAlignmentMetrics.prediction.verdict.toLowerCase().includes("moderate") ? "text-orange-500" : "text-red-500")}>
                  {roleFitAndAlignmentMetrics.prediction.verdict}
              </div>
            )}
            <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-1 max-h-[180px] sm:max-h-[200px]">
              <div className="w-full max-w-[220px] sm:max-w-[250px] h-full">
                {roleFitData.length > 0 ? (
                  <RoleFitRadarChart data={roleFitData} chartConfig={roleFitChartConfig} radarColor={roleFitRadarChartColor} />
                ) : <p className="text-xs text-muted-foreground">Not enough data for role fit graph.</p>}
              </div>
            </div>
            {roleFitAndAlignmentMetrics?.prediction?.reason && (
              <CardDescription className="mt-1 text-xs sm:text-sm shrink-0 px-2">
                  {roleFitAndAlignmentMetrics.prediction.reason}
              </CardDescription>
            )}
          </CardContent>
        </Card>

        <Card className={cn(
            "p-4 sm:p-6 flex flex-col min-h-[280px] sm:min-h-[320px]",
            "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-800/70 dark:via-yellow-800/60 dark:to-orange-800/50",
            "shadow-lg hover:shadow-xl transition-shadow"
        )}>
            <CardHeader className="p-0 mb-3">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
                     <SearchCheck className="mr-2 h-5 w-5 text-primary"/> Fluffy Detector
                </CardTitle>
                {fluffAnalysis?.summary && <CardDescription className="text-sm mt-1">{fluffAnalysis.summary}</CardDescription>}
            </CardHeader>
            <CardContent className="p-0 flex-grow"> 
                {hasFluff ? (
                    <Accordion type="single" collapsible className="w-full">
                        {fluffAnalysis?.detected?.map((item, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                                <AccordionTrigger className="text-sm py-3 hover:no-underline [&[data-state=open]>svg]:text-primary">
                                    <div className="flex items-center text-left">
                                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 shrink-0" />
                                        <span className="font-medium">{item.original}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm bg-muted/30 dark:bg-slate-800/50 p-3 rounded-md mt-1">
                                    <strong>Suggestion:</strong> {item.suggestion}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Check className="h-12 w-12 mb-2 text-green-500" />
                        <p className="text-md font-semibold text-green-600 dark:text-green-400">Looking Good!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {fluffAnalysis?.summary || "No significant filler language detected."}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* MODERNIZED Other Analysis Details */}
       <div className="mt-8 space-y-6">
            {keywordAnalysis && (keywordAnalysis.matchedKeywords?.length || keywordAnalysis.missingKeywords?.length || typeof keywordAnalysis.keywordDensityScore === 'number') && (
                <Card className="shadow-lg hover:shadow-xl transition-shadow p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/80 dark:via-indigo-800/80 dark:to-purple-800/80">
                    <CardHeader className="flex flex-row items-center space-x-3 px-0 pt-0">
                        <Tags className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-300">Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 text-sm space-y-3">
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Matched Keywords:</h4>
                            {keywordAnalysis.matchedKeywords && keywordAnalysis.matchedKeywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {keywordAnalysis.matchedKeywords.map(kw => <Badge key={kw} className="bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-200 dark:border-green-600">{kw}</Badge>)}
                                </div>
                            ) : <p className="text-muted-foreground italic">None found.</p>}
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 mt-3">Keywords to Consider:</h4>
                            {keywordAnalysis.missingKeywords && keywordAnalysis.missingKeywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {keywordAnalysis.missingKeywords.map(kw => <Badge key={kw} variant="outline" className="border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-300">{kw}</Badge>)}
                                </div>
                            ) : <p className="text-muted-foreground italic">None suggested.</p>}
                        </div>
                        {typeof keywordAnalysis.keywordDensityScore === 'number' && (
                             <div className="mt-3">
                                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Keyword Density Score:</h4>
                                <p className="text-primary font-bold text-lg">{keywordAnalysis.keywordDensityScore}%</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {resumeSuggestions && resumeSuggestions.length > 0 && (
                 <Card className="shadow-lg hover:shadow-xl transition-shadow p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/80 dark:via-emerald-800/80 dark:to-teal-800/80">
                    <CardHeader className="flex flex-row items-center space-x-3 px-0 pt-0">
                        <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-300">Resume Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <ul className="space-y-2.5 text-sm">
                            {resumeSuggestions.map((s, i) => (
                                <li key={`sug-${i}`} className="flex items-start">
                                    <CheckCircle2 className="h-5 w-5 mr-2.5 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

             {interviewPreparationTopics && interviewPreparationTopics.length > 0 && (
                 <Card className="shadow-lg hover:shadow-xl transition-shadow p-5 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-800/70 dark:via-amber-800/70 dark:to-orange-800/70">
                    <CardHeader className="flex flex-row items-center space-x-3 px-0 pt-0">
                        <ClipboardCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        <CardTitle className="text-lg font-semibold text-amber-800 dark:text-amber-300">Interview Preparation Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <ul className="space-y-2.5 text-sm">
                            {interviewPreparationTopics.map((s, i) => (
                                <li key={`topic-${i}`} className="flex items-start">
                                    <Zap className="h-5 w-5 mr-2.5 mt-0.5 text-amber-500 dark:text-amber-400 shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}