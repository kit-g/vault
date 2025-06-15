import type {NoteOut} from "../api";

interface NoteCardProps {
  note: NoteOut;
  onClick: () => void;
}


export function NoteCard({note, onClick}: NoteCardProps) {

  return (
    <div
      onClick={onClick}
      className="bg-[#1d2b24] hover:bg-[#27352d] p-4 rounded-lg cursor-pointer transition flex flex-col justify-between h-40"
    >
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">
          {note.title || "Untitled"}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2">
          {note.content || "No content"}
        </p>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Last edited: {new Date(note.updated_at ?? "").toLocaleString()}
      </div>
    </div>
  );
}
