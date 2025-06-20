import { NoteCardGrid } from "../components/NoteCardGrid.tsx";
import { NotesService } from "../api";

export default function BinPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bin</h1>
      <NoteCardGrid
        hydrate={ NotesService.getDeletedNotes }
        onRestore={ NotesService.restoreNote }
      >
      </NoteCardGrid>
    </div>
  );
}
