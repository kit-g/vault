import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {NoteOut} from "../api";
import {NotesService} from "../api";
import {NoteCard} from "../components/NoteCard";

export default function Dashboard() {
  const [notes, setNotes] = useState<NoteOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    NotesService.getNotes()
      .then(setNotes)
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-white text-2xl font-bold mb-4">My Notes</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
    </div>
  );
}
