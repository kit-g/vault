import { Seo } from "../components/Seo.tsx";
import { NotesService } from "../api";
import { NoteCardGrid } from "../components/NoteCardGrid.tsx";
import { useNavigate } from "react-router-dom";

export default function MyNotes() {
  const navigate = useNavigate();
  return (
    <>
      <Seo
        title="My Notes"
        description="Viewing notes that you have created."
      />
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>
      <NoteCardGrid
        hydrate={ NotesService.getNotes }
        onDelete={ deleteNote }
        onClickCard={ (noteId) => navigate(`/notes/${ noteId }`) }
      />
    </>
  );
}

const deleteNote = async ({ noteId }: { noteId: string }) => {
  if (!window.confirm("Are you sure you want to delete this note?")) {
    return;
  }
  await NotesService.deleteNote({ noteId: noteId });
};