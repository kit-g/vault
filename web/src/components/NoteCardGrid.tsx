import type {NoteOut} from "../api";
import {NoteCard} from "./NoteCard";
import {useNavigate} from "react-router-dom";

type NoteCardGridProps = {
  notes: NoteOut[];
};

export function NoteCardGrid({notes}: NoteCardGridProps) {
  const navigate = useNavigate();
  if (notes.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">No notes yet. Create one!</p>
    );
  }


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {
        notes.map(
          (note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => navigate(`/note/${note.id}`)}
            />
          )
        )
      }
    </div>
  );
}