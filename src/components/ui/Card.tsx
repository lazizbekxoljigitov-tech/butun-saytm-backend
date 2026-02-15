import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glass?: boolean;
}

export const Card = ({ children, className, onClick, glass = true }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl transition-all duration-300',
        glass ? 'bg-dark-light/40 backdrop-blur-lg border border-dark-border/30 hover:border-primary/30' : 'bg-dark-light border border-dark-border',
        onClick && 'cursor-pointer transform hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};
