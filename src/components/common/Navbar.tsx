// src/components/common/Navbar.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming you've added button via shadcn/ui
import { FileUser } from 'lucide-react';
// import Logo from './Logo'; // You'll create this
// Import Sheet, Menu, MenuIcon for mobile if needed

export default function Navbar() {
  return (
    <header className="py-4 px-6 md:px-10 shadow-sm"> {/* Basic styling */}
      <nav className="container mx-auto flex justify-between items-center">
        <FileUser className="h-6 w-6 text-primary"/>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/#features" className="hover:text-primary">Features</Link>
          <Link href="/#about" className="hover:text-primary">About</Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button> {/* Or use the hero button primarily */}
          </Link>
        </div>
        <div className="md:hidden">
          {/* Mobile menu button - e.g., using lucide-react icon and shadcn/ui Sheet */}
        </div>
      </nav>
    </header>
  );
}