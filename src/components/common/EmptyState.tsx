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
        "min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-20rem)]", // Ensures it takes up significant vertical space
        "px-4 py-8", // Standard padding
        className // Allow user-provided custom classes to override or extend
      )}
    >
      {/* Content is now directly inside the main styled container */}
      {Icon && (
        <div className="mb-6 mx-auto h-16 w-16 text-primary animate-pulse">
          <Icon className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1.25} />
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-5">
        {title}
      </h2>
      {/* Description's width will be naturally constrained by the 'container's max-width */}
      <p className="mt-4 text-lg text-muted-foreground">
        {description}
      </p>
      <div className="mt-8">
      <Button
        asChild
        size="lg"
        className="px-8 py-3 text-lg font-medium rounded-lg shadow-lg hover:shadow-primary/30 focus-visible:ring-primary/50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
      >
        <Link href={ctaLink}>{ctaText}</Link>
      </Button>
      </div>
    </div>
  );
};
