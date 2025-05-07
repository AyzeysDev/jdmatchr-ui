// src/app/page.tsx
import Link from 'next/link';
// import Image from 'next/image';
import Navbar from '@/components/common/Navbar'; // Assuming Navbar.tsx is in src/components/common/
import Footer from '@/components/common/Footer'; // Assuming Footer.tsx is in src/components/common/
import { Button } from '@/components/ui/button';   // Assuming you've added button via shadcn/ui

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white"> {/* Main page container */}
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero-section" className="relative text-center pt-20 pb-28 md:pt-28 md:pb-36 lg:pt-32 lg:pb-48 bg-gradient-to-b from-sky-50 to-slate-50 overflow-hidden">
          {/* Background elements can be added here if needed, e.g., subtle patterns or shapes */}
          
          <div className="container mx-auto px-6 sm:px-8 z-10 relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-slate-800 leading-tight">
              Analyze Resumes and JDs with Ease
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-xl md:max-w-2xl mx-auto mb-10">
              Quickly compare your resume against any job description and get actionable insights to land your dream job.
            </p>
            <Button size="lg" className="px-8 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Link href="/login">Log in to Get Started</Link>
          </Button>
          </div>
        </section>

        {/* Placeholder for Future Sections */}
        <section id="features" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Features</h2>
            <p className="text-lg text-slate-600 mb-12 max-w-xl mx-auto">
              Discover how JDMatchr helps you stand out.
            </p>
            {/* Grid for features - you'll build this out */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">ATS-Friendly Analysis</h3>
                <p className="text-slate-600">Get insights on how your resume scores against job descriptions.</p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Smart Suggestions</h3>
                <p className="text-slate-600">Receive AI-powered tips to tailor your resume effectively.</p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Interview Prep Guide</h3>
                <p className="text-slate-600">Generate key topics and questions based on the job details.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 bg-slate-50">
            <div className="container mx-auto px-6 sm:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
                <p className="text-lg text-slate-600 mb-12 max-w-xl mx-auto">
                    Simple steps to get your resume perfectly aligned.
                </p>
                {/* Steps content here */}
                 <div className="grid md:grid-cols-3 gap-8 text-left">
                    <div className="p-6">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">1</div>
                        <h3 className="mb-2 text-xl font-semibold">Upload Documents</h3>
                        <p className="text-slate-600">Easily upload your current resume and paste the job description youre targeting.</p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">2</div>
                        <h3 className="mb-2 text-xl font-semibold">Instant Analysis</h3>
                        <p className="text-slate-600">Our AI quickly analyzes both documents, identifying key skills and areas for improvement.</p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">3</div>
                        <h3 className="mb-2 text-xl font-semibold">Get Insights</h3>
                        <p className="text-slate-600">Receive your match score, actionable suggestions, and an interview prep guide on a dedicated page.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Placeholder for About Section or other content */}
        {/* <section id="about" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">About Us</h2>
            <p className="text-lg text-slate-600">...</p>
          </div>
        </section> */}

      </main>

      <Footer />
    </div>
  );
}