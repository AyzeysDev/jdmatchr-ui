// src/components/common/LoadingIndicator.tsx
import React from 'react';
// Loader2 is no longer needed if we use custom dots, but keep lucide-react for other icons if used elsewhere.
// import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  message?: string;
  className?: string; // For custom styling of the container
  // iconClassName and textClassName might not be directly applicable to the new dot style
  // but can be repurposed or removed if not needed.
  iconContainerClassName?: string; // For styling the div that holds the dots
  dotClassName?: string; // For styling individual dots (e.g., color)
  textClassName?: string;
  fullPage?: boolean; // If true, it will try to center itself in the viewport height
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  className,
  iconContainerClassName,
  dotClassName = "bg-primary", // Default dot color to primary
  textClassName,
  fullPage = true,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        fullPage ? "min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-20rem)]" : "py-10",
        className
      )}
    >
      {/* Container for the pulsing dots */}
      <div className={cn("flex space-x-2 mb-6", iconContainerClassName)}>
        {/* Dot 1 */}
        <div
          className={cn("h-3 w-3 rounded-full animate-pulse", dotClassName)}
          style={{ animationDelay: '0s', animationDuration: '1.2s' }} // animation-duration can make pulse more noticeable
        />
        {/* Dot 2 */}
        <div
          className={cn("h-3 w-3 rounded-full animate-pulse", dotClassName)}
          style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}
        />
        {/* Dot 3 */}
        <div
          className={cn("h-3 w-3 rounded-full animate-pulse", dotClassName)}
          style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}
        />
      </div>

      {/* Message text */}
      {message && (
        <p className={cn("text-lg text-muted-foreground", textClassName)}>
          ⏳ {message}
        </p>
      )}
    </div>
  );
};
