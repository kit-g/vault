import { NoteCardGrid } from "../components/NoteCardGrid.tsx";
import { NotesService } from "../api";

export default function BinPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bin</h1>
      <NoteCardGrid
        hydrate={ NotesService.getDeletedNotes }
        onRestore={ NotesService.restoreNote }
        onDelete={ deleteNote }
      >
      </NoteCardGrid>
    </div>
  );
}

const deleteNote = async ({ noteId }: { noteId: string }) => {
  if (!window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
    return;
  }
  await NotesService.deleteNote({ noteId: noteId, hard: true });
};