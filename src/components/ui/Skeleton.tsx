import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-dark-accent/50',
        className
      )}
    />
  );
};
