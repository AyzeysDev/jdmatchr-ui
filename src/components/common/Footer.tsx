// src/components/common/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-8 bg-slate-100 text-center text-slate-600">
      <div className="container mx-auto">
        <p className="mb-2">
          &copy; {currentYear} JDMatchr. All rights reserved.
        </p>
        <div className="space-x-4">
          <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}