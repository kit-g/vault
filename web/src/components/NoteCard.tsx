import type {NoteOut} from "../api";

interface NoteCardProps {
  note: NoteOut;
  onClick: () => void;
}


export function NoteCard({note, onClick}: NoteCardProps) {

  return (
    <div onClick={onClick} className="note-card">
      <div>
        <h3 className="font-semibold text-card-foreground">
          {note.title || "Untitled"}
        </h3>
        <p className="text-sm line-clamp-2 text-card-muted-foreground">
          {note.content || "No content"}
        </p>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Last edited: {new Date(note.updated_at ?? "").toLocaleString()}
      </div>
    </div>
  );
}
