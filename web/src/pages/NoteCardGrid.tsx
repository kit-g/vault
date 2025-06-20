import { type NoteOut } from "../api";
import { NoteCard } from "../components/NoteCard.tsx";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";


type NoteCardGridProps = {
  hydrate: (params: { page?: number, limit?: number }) => Promise<NoteOut[]>;
  onDelete?: (noteId: string) => Promise<void>;
}

export function NoteCardGrid({ hydrate, onDelete }: NoteCardGridProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotes = useCallback(() => {
    setLoading(true);
    hydrate({ page: currentPage, limit: 10 })
      .then(setNotes)
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, [currentPage]);


  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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
                onDelete={
                  onDelete
                    ? async (noteId: string) => onDelete(noteId).then(fetchNotes)
                    : undefined
                }
              />
            )
          )
        }
      </div>
    </div>
  );
}