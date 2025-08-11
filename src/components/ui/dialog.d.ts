declare module '@/components/ui/dialog' {
  import * as React from 'react';
  
  export const Dialog: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
  }>;
  
  export const DialogContent: React.FC<{
    className?: string;
    children: React.ReactNode;
  }>;
  
  export const DialogHeader: React.FC<{
    className?: string;
    children: React.ReactNode;
  }>;
  
  export const DialogTitle: React.FC<{
    className?: string;
    children: React.ReactNode;
  }>;
  
  export const DialogDescription: React.FC<{
    className?: string;
    children: React.ReactNode;
  }>;
}
