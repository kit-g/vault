import {useEffect, useState} from "react";
import type {NoteOut} from "../api";
import {NotesService} from "../api";
import {DashboardLayout} from "../components/DashboardLayout.tsx";
import {NoteCardGrid} from "../components/NoteCardGrid.tsx";

export default function Dashboard() {
  const [notes, setNotes] = useState<NoteOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    NotesService.getNotes()
      .then(setNotes)
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">My Notes</h1>
      {
        loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <NoteCardGrid notes={notes}/>
        )}
    </DashboardLayout>
  );
}
