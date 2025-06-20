import { Seo } from "../components/Seo.tsx";
import { NotesService } from "../api";
import { NoteCardGrid } from "../components/NoteCardGrid.tsx";

export default function MyNotes() {
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
      />
    </>
  );
}

const deleteNote = async (noteIdToDelete: string) => {
  if (!window.confirm("Are you sure you want to delete this note?")) {
    return;
  }
  await NotesService.deleteNote({ noteId: noteIdToDelete });
};