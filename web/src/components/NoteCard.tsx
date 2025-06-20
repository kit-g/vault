import type { NoteOut } from "../api";
import { stripHtml } from "../utils/text.ts";

interface NoteCardProps {
  note: NoteOut;
  onClick: () => void;
}


export function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <div onClick={ onClick } className="note-card hover-elevate">
      <div>
        <h3 className="font-semibold text-card-foreground">
          { note.title || "Untitled" }
        </h3>
        <p className="text-sm line-clamp-2 text-card-muted-foreground max-h-24 overflow-ellipsis whitespace-pre-line">
          { note.content ? stripHtml(note.content) : "..." }
        </p>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Last edited: { new Date(note.updated_at ?? "").toLocaleString() }
      </div>
    </div>
  );
}
