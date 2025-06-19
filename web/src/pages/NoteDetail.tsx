import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type NoteIn, NotesService } from "../api";
import { Seo } from "../components/Seo";
import { RichTextEditor } from "../components/RichTextEditor.tsx";

export default function NoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewNote = !id;

  const [note, setNote] = useState<NoteIn>({ title: '', content: '' });
  const [loading, setLoading] = useState(!isNewNote); // Only load if we are editing

  useEffect(() => {
    // If this is an existing note, fetch its data
    if (id) {
      NotesService.getNote(id)
        .then((note) => {
          setNote({ title: note.title!, content: note.content || '' });
        })
        .catch(err => console.error("Failed to fetch note", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const toNotes = () => navigate("/", { replace: true });

  const handleSave = () => {
    if (isNewNote) {
      NotesService.createNote(note)
        .then(() => toNotes())
        .catch(err => console.error("Failed to create note", err));
    } else {
      NotesService.editNote(id!, note)
        .then(() => toNotes())
        .catch(err => console.error("Failed to update note", err));
    }
  };

  const handleContentChange = (htmlContent: string) => {
    setNote(prev => ({ ...prev, content: htmlContent }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(prev => ({ ...prev, title: e.target.value }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Seo title={ isNewNote ? "New Note" : note.title }/>
      <div className="flex w-full h-full p-6 gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <input
            name="title"
            placeholder="Note Title"
            value={ note.title }
            onChange={ handleTitleChange }
            className="w-full h-14 p-4 text-2xl font-bold bg-transparent focus:outline-none"
          />
          <RichTextEditor
            content={ note.content }
            onChange={ handleContentChange }
          />
          <button onClick={ handleSave } className="btn self-start">
            { isNewNote ? 'Create Note' : 'Save Changes' }
          </button>
        </div>
      </div>
    </>
  );
}