// src/components/common/Navbar.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileUser, Menu } from 'lucide-react'; // FileUser for logo, Menu for mobile
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // For mobile menu drawer
import { ThemeToggle } from './ThemeToggle'; // Import the ThemeToggle component

export default function Navbar() {
  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How It Works" },
    // You can add more landing page sections here if needed
  ];

  return (
    <header className="py-4 px-6 md:px-10 shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/*
        - py-4 px-6 md:px-10: Padding
        - shadow-sm: Subtle shadow
        - sticky top-0 z-50: Makes the navbar stick to the top and stay above other content
        - bg-background/95: Semi-transparent background (uses your theme's background color)
        - backdrop-blur supports-[backdrop-filter]:bg-background/60: Adds a blur effect to the background for modern UIs, with a fallback.
      */}
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Link - scrolls to #hero-section */}
        <Link href="/#hero-section" className="flex items-center space-x-2 text-xl font-semibold hover:opacity-80 transition-opacity">
          <FileUser className="h-7 w-7 text-primary" /> {/* Icon */}
          <span className="text-foreground">JDMatchr</span> {/* App Name */}
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <ThemeToggle /> {/* Added ThemeToggle button for desktop */}
        </div>

        {/* Mobile Controls: Theme Toggle and Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle /> {/* Added ThemeToggle button for mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="mb-6">
                <SheetTitle>
                  <Link href="/#hero-section" className="flex items-center space-x-2 text-lg font-semibold">
                    <FileUser className="h-6 w-6 text-primary" />
                    <span>JDMatchr</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="grid gap-4">
                {navLinks.map((link) => (
                  // Assuming SheetClose can be used to close the sheet on navigation for mobile
                  // For now, simple links. You might need to manage sheet state for auto-close.
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-3" />
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
