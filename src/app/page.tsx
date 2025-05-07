// src/app/page.tsx
import Link from 'next/link';
// import Image from 'next/image'; // Import next/image
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JDMatchr | AI Resume & JD Analyzer for Job Seekers',
  description: 'Optimize your resume against job descriptions with JDMatchr. Get AI-powered insights, ATS scores, and interview prep tips to land your dream job.',
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950"> {/* Added dark mode background */}
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="hero-section" // For navbar link
          className="relative text-center pt-20 pb-28 md:pt-28 md:pb-36 lg:pt-32 lg:pb-48 bg-gradient-to-b from-sky-100 via-slate-50 to-white dark:from-sky-900 dark:via-slate-800 dark:to-slate-950 overflow-hidden"
        >
          <div className="container mx-auto px-6 sm:px-8 relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-slate-800 dark:text-slate-100 leading-tight">
              Analyze Resumes and JD&apos;s with Ease
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl md:max-w-2xl mx-auto mb-10">
              Quickly compare your resume against any job description and get actionable insights to land your dream job.
            </p>
            {/* Corrected Button with asChild and nested Link */}
            <Button asChild size="lg" className="px-8 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Link href="/login">Get Started Now</Link>
            </Button>
          </div>

          {/* <div
            className="absolute left-0 w-full h-[100px] md:h-[150px] lg:h-[180px] -bottom-1" // -bottom-1 for slight overlap
            style={{ zIndex: 5 }} // Ensures wave is above background but below content if necessary
          >
            <Image
              src="/wavy-dash-svgrepo-com.svg" // Ensure this path is correct (public/wavy-dash-svgrepo-com.svg)
              alt="" // Decorative image, alt text can be empty
              fill // Modern prop to make the image fill its parent container
              style={{
                objectFit: "cover", // Or "contain" or "fill" depending on SVG aspect ratio and desired look
                objectPosition: "bottom", // Aligns the bottom of the SVG
              }}
              priority // Good for LCP elements
            />
          </div> */}
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-white dark:bg-slate-950">
          <div className="container mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Features</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-xl mx-auto">
              Discover how JDMatchr helps you stand out.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg bg-slate-50 dark:bg-slate-800/30 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">ATS-Friendly Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400">Get insights on how your resume scores against job descriptions.</p>
              </div>
              {/* Feature Card 2 */}
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg bg-slate-50 dark:bg-slate-800/30 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">Smart Suggestions</h3>
                <p className="text-slate-600 dark:text-slate-400">Receive AI-powered tips to tailor your resume effectively.</p>
              </div>
              {/* Feature Card 3 */}
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg bg-slate-50 dark:bg-slate-800/30 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">Interview Prep Guide</h3>
                <p className="text-slate-600 dark:text-slate-400">Generate key topics and questions based on the job details.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-slate-100 dark:bg-slate-900">
            <div className="container mx-auto px-6 sm:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">How It Works</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-xl mx-auto">
                    Simple steps to get your resume perfectly aligned.
                </p>
                 <div className="grid md:grid-cols-3 gap-8 text-left">
                    {/* Step 1 */}
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl mx-auto md:mx-0">1</div>
                        <h3 className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-200 text-center md:text-left">Upload Documents</h3>
                        <p className="text-slate-600 dark:text-slate-400">Easily upload your current resume and paste the job description you&apos;re targeting.</p>
                    </div>
                    {/* Step 2 */}
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl mx-auto md:mx-0">2</div>
                        <h3 className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-200 text-center md:text-left">Instant Analysis</h3>
                        <p className="text-slate-600 dark:text-slate-400">Our AI quickly analyzes both documents, identifying key skills and areas for improvement.</p>
                    </div>
                    {/* Step 3 */}
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl mx-auto md:mx-0">3</div>
                        <h3 className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-200 text-center md:text-left">Get Insights</h3>
                        <p className="text-slate-600 dark:text-slate-400">Receive your match score, actionable suggestions, and an interview prep guide on a dedicated page.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
