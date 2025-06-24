import { Seo } from "../components/Seo.tsx";
import { NotesService } from "../api";
import { NoteCardGrid } from "../components/NoteCardGrid.tsx";
import { useNavigate } from "react-router-dom";

export default function SharedWithMe() {
  const navigate = useNavigate();
  return (
    <>
      <Seo
        title="Shared With Me"
        description="Viewing notes that you have created."
      />
      <h1 className="text-2xl font-bold mb-4">Shared With Me</h1>
      <NoteCardGrid
        hydrate={ NotesService.getSharedNotes }
        onClickCard={ (noteId) => navigate(`/notes/${ noteId }`) }
      />
    </>
  );
}

