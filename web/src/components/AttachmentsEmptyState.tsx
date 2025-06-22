import { Paperclip } from 'lucide-react';

export function AttachmentsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center h-full p-4 border-2 border-dashed border-[var(--border)] rounded-lg">
      <div className="mb-4">
        <Paperclip size={ 32 } className="text-[var(--muted-foreground)]"/>
      </div>
      <p className="text-sm font-bold text-[var(--foreground)]">Attach Files</p>
      <p className="text-xs text-[var(--muted-foreground)] mt-1">
        Drag and drop files here, or click the paperclip icon in the editor toolbar. Max file size is 10MB.
      </p>
    </div>
  );
}