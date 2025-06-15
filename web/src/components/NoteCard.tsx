import type {NoteOut} from "../api";

interface NoteCardProps {
  note: NoteOut;
  onClick: () => void;
}

export function NoteCard({note, onClick}: NoteCardProps) {
  return (
    <div
      className="rounded-lg p-4 bg-[#1d2b24] hover:bg-[#27352d] cursor-pointer transition"
      onClick={onClick}
    >
      <h3 className="text-white font-semibold text-lg mb-2">{note.title}</h3>
      <p className="text-sm text-gray-400 line-clamp-3">{note.content}</p>
    </div>
  );
}
