import { AlertCircle, Check } from 'lucide-react';

export function SaveStatusIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  switch (status) {
    case 'saving':
      return <p className="text-sm text-[var(--muted-foreground)]">Saving...</p>;
    case 'saved':
      return <p className="text-sm flex items-center gap-2 text-green-500">Saved <Check size={ 16 }/></p>;
    case 'error':
      return <p className="text-sm flex items-center gap-2 text-red-500">Failed to save <AlertCircle size={ 16 }/></p>;
    default:
      return null; // Don't show anything when idle or dirty
  }
}