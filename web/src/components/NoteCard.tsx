import type { NoteOut } from "../api";
import { stripHtml } from "../utils/text.ts";
import * as React from "react";
import { Trash2, Undo2 } from "lucide-react";

interface NoteCardProps {
  note: NoteOut;
  onClick: () => void;
  onDelete?: ({ noteId }: { noteId: string }) => Promise<void>;
  onRestore?: ({ noteId }: { noteId: string }) => Promise<void>;
}


export function NoteCard({ note, onClick, onDelete, onRestore }: NoteCardProps) {

  const onClickDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && note.id) {
      await onDelete({ noteId: note.id });
    }
  }

  return (
    <div onClick={ onClick } className="note-card hover-elevate relative group">
      { (onRestore || onDelete) && (
        <div className="absolute top-2 right-2 flex flex-row-reverse items-center gap-x-2">
          { onDelete && (
            <button
              onClick={ onClickDelete }
              aria-label="Delete note"
              className="icon-button error"
            >
              <Trash2 size={ 18 }/>
            </button>
          ) }
          { onRestore && note?.id && (
            <button
              onClick={ async (e) => {
                e.stopPropagation();
                await onRestore({ noteId: note.id! });
              } }
              aria-label="Restore note"
              className="icon-button"
            >
              <Undo2 size={ 18 }/>
            </button>
          ) }
        </div>
      ) }
      <div>
        <h3 className="font-semibold text-card-foreground">
          { note.title || "Untitled" }
        </h3>
        <p className="text-sm line-clamp-2 whitespace-pre-line text-card-muted-foreground">
          { note.content ? stripHtml(note.content) : "..." }
        </p>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Last edited: { new Date(note.updated_at ?? "").toLocaleString() }
      </div>
    </div>
  );
}
