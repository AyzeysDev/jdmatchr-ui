import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileUser, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How It Works" },

  ];

  return (
    <header className="py-4 px-6 md:px-10 shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/#hero-section" className="flex items-center space-x-2 text-xl font-semibold hover:opacity-80 transition-opacity">
          <FileUser className="h-7 w-7 text-primary" />
          <span className="text-foreground">JDMatchr</span>
        </Link>
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
        </div>
        <div className="md:hidden">
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
