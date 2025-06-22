import { AlertCircle, CheckCircle2, Download, Paperclip, X } from "lucide-react";
import { formatBytes } from "../utils/numbers.ts";
import * as React from "react";
import { Tooltip } from "./Tooltip.tsx";

interface AttachmentItemProps {
  attachmentId?: string;
  name: string;
  status: 'uploading' | 'success' | 'error' | 'idle';
  mimeType?: string;
  size?: number; // in bytes
  progress?: number;
  error?: string;
  onDelete?: (attachmentId: string) => void;
  onDownload?: (attachmentId: string) => void;
}

export function AttachmentItem(
  { attachmentId, name, status, progress = 0, mimeType, size, onDelete, onDownload }: AttachmentItemProps
) {
  const tooltip = `${ name }\n${ mimeType }\n${ formatBytes(size || 0) }`;

  const onClickDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && attachmentId) {
      onDelete(attachmentId);
    }
  };

  const onClickDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload && attachmentId) onDownload(attachmentId);
  };

  return (
    <Tooltip tip={ tooltip }>
      <div className="relative group flex items-center gap-3 p-2 rounded-lg bg-[var(--subtle-bg)] toolbar-btn w-full">
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

        <div className="
        absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1
        opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          {
            onDownload && (
              <button onClick={ onClickDownload } className="p-1.5 rounded-full hover:bg-black/10"
                      aria-label="Download attachment">
                <Download size={ 16 }/>
              </button>
            )
          }
          {
            onDelete && (
              <button onClick={ onClickDelete }
                      className="p-1.5 rounded-full hover:bg-black/10 text-[var(--error-color)]"
                      aria-label="Delete attachment">
                <X size={ 16 }/>
              </button>
            )
          }
        </div>
        <div className="flex-shrink-0">
          { status === 'success' && <CheckCircle2 size={ 18 } className="success"/> }
          { status === 'error' && <AlertCircle size={ 18 } className="error"/> }
        </div>
      </div>
    </Tooltip>
  );
}