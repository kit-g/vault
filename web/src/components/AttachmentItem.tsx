import { AlertCircle, CheckCircle2, Paperclip } from "lucide-react";

interface AttachmentItemProps {
  name: string;
  status: 'uploading' | 'success' | 'error' | 'idle';
  progress?: number;
  error?: string;
}

export function AttachmentItem({ name, status, progress = 0 }: AttachmentItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--subtle-bg)] toolbar-btn">
      <div className="flex-shrink-0">
        { status === 'uploading'
          ? <div className="size-4 border-2 rounded-full border-t-transparent animate-spin"/>
          : <Paperclip size={ 18 }/>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{ name }</p>
        { status === 'uploading' && (
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div className="success h-1 rounded-full" style={ { width: `${ progress }%` } }></div>
          </div>
        ) }
      </div>
      <div className="flex-shrink-0">
        { status === 'success' && <CheckCircle2 size={ 18 } className="success"/> }
        { status === 'error' && <AlertCircle size={ 18 } className="error"/> }
      </div>
    </div>
  );
}