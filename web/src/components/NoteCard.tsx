import type { NoteOut } from "../api";
import { stripHtml } from "../utils/text.ts";
import * as React from "react";
import { Trash2 } from "lucide-react";

interface NoteCardProps {
  note: NoteOut;
  onClick: () => void;
  onDelete?: (noteId: string) => void;
}


export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {

  const onClickDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && note.id) {
      onDelete(note.id);
    }
  }

  return (
    <div onClick={ onClick } className="note-card hover-elevate relative group">
      <button
        onClick={ onClickDelete }
        aria-label="Delete note"
        className="absolute top-2 right-2 p-1.5 rounded-full error bg-black/10
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   hover:bg-black/20"
      >
        <Trash2 size={ 18 }/>
      </button>

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
