import { AlertCircle, CheckCircle2, Paperclip, X } from "lucide-react";
import { formatBytes } from "../utils/numbers.ts";
import Tippy from "@tippyjs/react";
import * as React from "react";

interface AttachmentItemProps {
  attachmentId?: string;
  name: string;
  status: 'uploading' | 'success' | 'error' | 'idle';
  mimeType?: string;
  size?: number; // in bytes
  progress?: number;
  error?: string;
  onDelete?: (attachmentId: string) => void;
}

export function AttachmentItem(
  { attachmentId, name, status, progress = 0, mimeType, size, onDelete }: AttachmentItemProps
) {
  const tooltip = `${ name }\n${ mimeType }\n${ formatBytes(size || 0) }`;

  const onClickDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && attachmentId) {
      onDelete(attachmentId);
    }
  };

  return (
    <Tippy
      content={ <div style={ { whiteSpace: 'pre-line' } }>{ tooltip }</div> }
      delay={ [1000, 0] } // Show after 1000ms (1 sec), hide instantly
      placement="top"
    >
      <div className="relative group flex items-center gap-3 p-2 rounded-lg bg-[var(--subtle-bg)] toolbar-btn">
        <div className="flex-shrink-0">
          { status === 'uploading'
            ? <div className="size-4 border-2 rounded-full border-t-transparent animate-spin"/>
            : <Paperclip size={ 18 }/>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{ name }</p>

          <p className="text-xs text-[var(--muted-foreground)] truncate">
            { formatBytes(size || 0) } • { mimeType }
          </p>

          { status === 'uploading' && (
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div className="success h-1 rounded-full" style={ { width: `${ progress }%` } }></div>
            </div>
          ) }
        </div>

        { onDelete && (
          <button
            onClick={ onClickDelete }
            className="absolute top-1 right-1 p-1 rounded-full text-[var(--muted-foreground)] hover:bg-black/10
                       opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete attachment"
          >
            <X size={ 16 }/>
          </button>
        ) }
        <div className="flex-shrink-0">
          { status === 'success' && <CheckCircle2 size={ 18 } className="success"/> }
          { status === 'error' && <AlertCircle size={ 18 } className="error"/> }
        </div>
      </div>
    </Tippy>
  );
}