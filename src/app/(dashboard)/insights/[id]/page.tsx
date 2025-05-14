// // src/app/(dashboard)/insights/[id]/page.tsx
// "use client";

// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { LoadingIndicator } from '@/components/common/LoadingIndicator';
// import { AlertTriangle, CheckCircle, Lightbulb, ListChecks, MessageSquareWarning, Target, ArrowLeft, ExternalLink, FileText, CalendarDays } from 'lucide-react';
// import { Progress } from "@/components/ui/progress"; // For match score visualization
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion";

// // Matches the structure of the 'keywordAnalysis' map in Spring Boot
// interface KeywordAnalysisData {
//   matchedKeywords?: string[];
//   missingKeywords?: string[];
//   keywordDensityScore?: number; // Example, if you add this
// }

// // Matches the structure of the 'analysisResult' map in Spring Boot
// interface AnalysisResultPayload {
//   overallMatchScore?: string; // This is the string like "85.5%"
//   keywordAnalysis?: KeywordAnalysisData;
//   resumeSuggestions?: string[];
//   interviewPreparationTopics?: string[];
//   // Add other fields from your backend's analysisResult map
//   suggestions?: string[]; // From your Postman example
//   keywordMatches?: string[]; // From your Postman example
//   overallSentiment?: string; // From your Postman example
//   atsScoreRaw?: number; // From your Postman example (this is likely the numeric matchScore)
// }

// // This is the main data structure for the page, matching InsightDetailDto
// export interface InsightPageData {
//   id: string;
//   jobTitle: string;
//   jobDescriptionSummary?: string | null;
//   resumeFilename?: string | null;
//   matchScore?: number | null; // The numeric score (e.g., 67.0)
//   analysisResult: AnalysisResultPayload | null;
//   analysisDate: string; // ISO string
// }

// interface ApiErrorResponse {
//     message: string;
// }

// // Helper component for displaying a list of items
// const ListItem: React.FC<{ item: string; icon?: React.ElementType }> = ({ item, icon: Icon }) => (
//   <li className="flex items-start space-x-2 py-1">
//     {Icon && <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />}
//     <span>{item}</span>
//   </li>
// );

// // Helper component for sections
// const InsightSection: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = false }) => (
//   <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : undefined} className="w-full">
//     <AccordionItem value="item-1" className="border-b border-border/60">
//       <AccordionTrigger className="text-xl font-semibold hover:no-underline py-4">
//         <div className="flex items-center space-x-3">
//           {Icon && <Icon className="h-6 w-6 text-primary/80" />}
//           <span>{title}</span>
//         </div>
//       </AccordionTrigger>
//       <AccordionContent className="pt-2 pb-4 text-muted-foreground">
//         {children}
//       </AccordionContent>
//     </AccordionItem>
//   </Accordion>
// );


// export default function InsightDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const insightId = params?.id as string | undefined;

//   const [insightData, setInsightData] = useState<InsightPageData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchInsightDetail = useCallback(async (id: string) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(`/api/insights/detail/${id}`); // Calls your Next.js API route
//       const responseData = await response.json();

//       if (!response.ok) {
//         const error = responseData as ApiErrorResponse;
//         throw new Error(error.message || `Failed to fetch insight details: ${response.statusText}`);
//       }
//       setInsightData(responseData as InsightPageData);
//     } catch (err: unknown) {
//       console.error("Error fetching insight detail:", err);
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("An unexpected error occurred while fetching insight details.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (insightId) {
//       fetchInsightDetail(insightId);
//     } else {
//       // Handle case where ID might not be available initially (though App Router should provide it)
//       setError("Insight ID not found in URL.");
//       setIsLoading(false);
//     }
//   }, [insightId, fetchInsightDetail]);

//   const formatDate = (dateString: string) => {
//     try {
//       if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
//       return new Date(dateString).toLocaleDateString(undefined, {
//         year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
//       });
//     } catch (e) { return dateString; }
//   };

//   if (isLoading) {
//     return <LoadingIndicator message="Loading your insight report..." fullPage={true} />;
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-8 text-center">
//         <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
//         <h2 className="text-2xl font-semibold text-destructive mb-3">Failed to Load Insight</h2>
//         <p className="text-muted-foreground max-w-md mb-8">{error}</p>
//         <Button onClick={() => router.push('/history')} variant="outline">
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
//         </Button>
//       </div>
//     );
//   }

//   if (!insightData) {
//     // This case might be hit if fetch completes but data is null (e.g., 404 from backend handled by API route)
//     return (
//          <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-8 text-center">
//             <FileText className="w-16 h-16 text-muted-foreground mb-6" />
//             <h2 className="text-2xl font-semibold text-foreground mb-3">Insight Not Found</h2>
//             <p className="text-muted-foreground max-w-md mb-8">The requested analysis report could not be found or you may not have permission to view it.</p>
//             <Button onClick={() => router.push('/history')} variant="outline">
//              <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
//             </Button>
//       </div>
//     );
//   }

//   const { jobTitle, matchScore, analysisResult, analysisDate, resumeFilename, jobDescriptionSummary } = insightData;
//   const numericMatchScore = matchScore ?? analysisResult?.atsScoreRaw ?? 0;


//   // Consolidate keywords and suggestions from potentially different structures in analysisResult
//   const matchedKeywords = analysisResult?.keywordAnalysis?.matchedKeywords || analysisResult?.keywordMatches || [];
//   const missingKeywords = analysisResult?.keywordAnalysis?.missingKeywords || analysisResult?.missingKeywords || [];
//   const suggestions = analysisResult?.resumeSuggestions || analysisResult?.suggestions || [];
//   const interviewTopics = analysisResult?.interviewPreparationTopics || [];


//   return (
//     <div className="container mx-auto max-w-4xl py-8 px-4 md:px-6 lg:px-8 space-y-8">
//       <header className="space-y-2 mb-8">
//         <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back
//         </Button>
//         <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{jobTitle}</h1>
//         <div className="flex items-center space-x-3 text-sm text-muted-foreground">
//           {resumeFilename && (
//             <span className="flex items-center"><FileText className="mr-1.5 h-4 w-4" /> {resumeFilename}</span>
//           )}
//           <span className="flex items-center"><CalendarDays className="mr-1.5 h-4 w-4" /> Analyzed: {formatDate(analysisDate)}</span>
//         </div>
//       </header>

//       {/* Overall Score Section */}
//       <Card className="shadow-lg">
//         <CardHeader>
//           <CardTitle className="text-2xl flex items-center">
//             <Target className="mr-3 h-7 w-7 text-primary" /> Overall Match Score
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="text-6xl font-bold text-primary text-center my-4">
//             {numericMatchScore.toFixed(1)}%
//           </div>
//           <Progress value={numericMatchScore} className="w-full h-3" />
//           <p className="text-center text-muted-foreground">
//             {analysisResult?.overallSentiment || (numericMatchScore >= 80 ? "Strong Match!" : numericMatchScore >=60 ? "Good Potential" : "Needs Improvement")}
//           </p>
//         </CardContent>
//       </Card>

//       {/* Keyword Analysis Section */}
//       {(matchedKeywords.length > 0 || missingKeywords.length > 0) && (
//         <InsightSection title="Keyword Analysis" icon={ListChecks} defaultOpen={true}>
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="font-semibold text-lg mb-2 text-green-600 dark:text-green-400">Matched Keywords</h4>
//               {matchedKeywords.length > 0 ? (
//                 <ul className="space-y-1 list-inside">
//                   {matchedKeywords.map((keyword, index) => (
//                     <ListItem key={`match-${index}`} item={keyword} icon={CheckCircle} />
//                   ))}
//                 </ul>
//               ) : <p>No specific keyword matches highlighted.</p>}
//             </div>
//             <div>
//               <h4 className="font-semibold text-lg mb-2 text-amber-600 dark:text-amber-400">Missing Keywords</h4>
//               {missingKeywords.length > 0 ? (
//                 <ul className="space-y-1 list-inside">
//                   {missingKeywords.map((keyword, index) => (
//                     <ListItem key={`miss-${index}`} item={keyword} icon={MessageSquareWarning} />
//                   ))}
//                 </ul>
//               ) : <p>No critical missing keywords identified.</p>}
//             </div>
//           </div>
//           {analysisResult?.keywordAnalysis?.keywordDensityScore && (
//             <p className="mt-4 text-sm">Keyword Density Score: {analysisResult.keywordAnalysis.keywordDensityScore}%</p>
//           )}
//         </InsightSection>
//       )}

//       {/* Suggestions Section */}
//       {suggestions.length > 0 && (
//         <InsightSection title="Resume Suggestions" icon={Lightbulb} defaultOpen={true}>
//           <ul className="space-y-2">
//             {suggestions.map((suggestion, index) => (
//               <ListItem key={`sug-${index}`} item={suggestion} icon={Lightbulb} />
//             ))}
//           </ul>
//         </InsightSection>
//       )}

//       {/* Interview Preparation Section */}
//       {interviewTopics.length > 0 && (
//         <InsightSection title="Interview Preparation Topics" icon={FileText}>
//           <ul className="space-y-2">
//             {interviewTopics.map((topic, index) => (
//               <ListItem key={`prep-${index}`} item={topic} icon={CheckCircle} />
//             ))}
//           </ul>
//         </InsightSection>
//       )}

//       {/* Raw Analysis Result (for debugging or full detail) - Optional */}
//       {process.env.NODE_ENV === 'development' && analysisResult && (
//         <InsightSection title="Raw Analysis Data (Dev Only)" icon={AlertTriangle}>
//           <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
//             {JSON.stringify(analysisResult, null, 2)}
//           </pre>
//         </InsightSection>
//       )}

//       <CardFooter className="mt-8 flex justify-center">
//           <Button onClick={() => router.push('/analyze')}>
//               <PlusCircle className="mr-2 h-4 w-4" /> Analyze Another JD
//           </Button>
//       </CardFooter>
//     </div>
//   );
// }
