import { useParams } from "react-router-dom";
import { Seo } from "../components/Seo.tsx";
import { useEffect, useState } from "react";
import { type NoteOut, NotesService } from "../api";

export default function NoteDetail() {
  const [note, setNote] = useState<NoteOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (id != null) {
      NotesService.getNote(id)
        .then(setNote)
        .catch(() => setError("Failed to load note"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{ error }</div>;

  return (
    <>
      <Seo
        title={ note?.title || "Note Detail" }
        description={ note?.content?.substring(0, 150) || "Viewing note details." }
      />
      <div>
        <h1>{ note?.title || "" }</h1>
        <p>{ note?.content }</p>
      </div>
    </>
  );
}