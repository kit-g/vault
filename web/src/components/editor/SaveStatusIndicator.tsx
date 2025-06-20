import { AlertCircle, Check } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | undefined;


function Spinner() {
  return (
    <div className="size-4 border-2 border-solid rounded-full border-t-transparent animate-spin"
         style={ { borderColor: 'var(--muted-foreground)' } }
    />
  );
}

export function SaveStatusIndicator({ status }: { status?: SaveStatus }) {
  switch (status) {
    case 'saving':
      return (
        <div className="flex items-center gap-2 text-sm" style={ { color: 'var(--muted-foreground)' } }>
          <Spinner/>
        </div>
      );
    case 'saved':
      return <p className="flex items-center gap-2 text-sm" style={ { color: 'var(--success)' } }>Saved <Check
        size={ 16 }/></p>;
    case 'error':
      return <p className="flex items-center gap-2 text-sm" style={ { color: 'var(--error)' } }><AlertCircle
        size={ 16 }/></p>;
    default:
      // Return an empty div to maintain space in the toolbar if you want
      return <div className="h-5"/>;
  }
}