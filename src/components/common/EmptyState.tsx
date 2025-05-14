// src/components/common/EmptyState.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  Icon?: LucideIcon;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  className?: string; // Allow passing additional classes for the container
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  Icon,
  title,
  description,
  ctaText,
  ctaLink,
  className,
}) => {
  return (
    // Apply container, flex, centering, min-height, and padding directly to this root div
    // This div will now behave like the main div in your DesignPage
    <div
      className={cn(
        "container mx-auto", // Constrains width and centers the block
        "flex flex-col items-center justify-center text-center", // Centers content within the container
        // Match the min-height from your DesignPage if desired, or keep current for more flexibility
        // "min-h-[calc(100vh-10rem)]", // Exact match to DesignPage
        "min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-20rem)]", // Current flexible height
        "px-4 py-8", // Standard padding
        className // Allow user-provided custom classes to override or extend
      )}
    >
      {/* Content is now directly inside the main styled container */}
      {Icon && (
        <div className="mb-8 p-5 bg-primary/10 rounded-full text-primary animate-pulse duration-3000 ease-in-out">
          <Icon className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1.25} />
        </div>
      )}
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      {/* Description's width will be naturally constrained by the 'container's max-width.
          You can add an additional max-w-lg or max-w-md here if you want the paragraph
          to be narrower than the overall container for very long descriptions.
      */}
      <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed mb-10">
        {description}
      </p>
      <Button
        asChild
        size="lg"
        className="px-8 py-3 text-lg font-medium rounded-lg shadow-lg hover:shadow-primary/30 focus-visible:ring-primary/50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
      >
        <Link href={ctaLink}>{ctaText}</Link>
      </Button>
    </div>
  );
};
