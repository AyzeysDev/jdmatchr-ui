// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google"; // Corrected import for Geist fonts
import "./globals.css";
import { ThemeProvider } from '@/contexts/ThemeProvider'; // Adjust path if needed

// Initialize Geist Sans font with variable and subsets
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS variable for Geist Sans
  subsets: ["latin"],
});

// Initialize Geist Mono font with variable and subsets
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS variable for Geist Mono
  subsets: ["latin"],
}); 

// RootLayout component: Defines the main HTML structure for all pages
export default function RootLayout({
  children,
}: Readonly<{ // Using Readonly as per your provided snippet
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning, recommended by next-themes
    // Also, ensure the font variables are applied here if they are meant for the html tag,
    // or on the body tag as originally intended. For shadcn/ui, body is typical.
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        // The font-sans class from Tailwind will typically use the --font-geist-sans variable
        // if your tailwind.config.ts (or globals.css for Tailwind v4) is set up to use it.
        // Example Tailwind config for fonts:
        // theme: {
        //   extend: {
        //     fontFamily: {
        //       sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        //       mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
        //     },
        //   },
        // },
      >
        {/* ThemeProvider wraps the children to enable theme switching */}
        <ThemeProvider
          attribute="class" // Applies theme by adding a class to the html tag (e.g., "dark")
          defaultTheme="system" // Default theme based on user's system preference
          enableSystem // Allows users to choose "system" preference
          disableTransitionOnChange // Prevents transitions during theme change to avoid flashes
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
