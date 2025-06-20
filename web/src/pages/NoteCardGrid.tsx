import { type NoteOut, NotesService } from "../api";
import { NoteCard } from "../components/NoteCard.tsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


export function NoteCardGrid() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    NotesService.getNotes({ limit: 20 })
      .then(setNotes)
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{ error }</div>;

  if (!notes || notes.length === 0) {
    return (
      <p className="text-center text-gray-200 mt-10">No notes yet. Create one!</p>
    );
  }


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {
          notes.map(
            (note) => (
              <NoteCard
                key={ note.id }
                note={ note }
                onClick={ () => navigate(`/notes/${ note.id }`) }
              />
            )
          )
        }
      </div>
    </div>
  );
}