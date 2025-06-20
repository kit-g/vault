import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type NoteIn, NotesService } from "../api";
import { Seo } from "../components/Seo";
import { RichTextEditor } from "../components/editor/RichTextEditor.tsx";
import { useDebounce } from "use-debounce";
import { SaveStatusIndicator } from "../components/editor/SaveStatusIndicator.tsx";

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function NoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewNote = !id;

  const [noteId, setNoteId] = useState<string | null>(id || null);
  const [note, setNote] = useState<NoteIn>({ title: '', content: '' });
  const [debouncedNote] = useDebounce(note, 2000); // debounce the note state by 2 seconds
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(!!noteId); // only load if an ID exists
  const [isDirty, setIsDirty] = useState(false); // if the user has made changes

  useEffect(() => {
    // If this is an existing note, fetch its data
    if (id) {
      setLoading(true);
      NotesService.getNote(id)
        .then((note) => {
          setNote({ title: note.title!, content: note.content || '' });
        })
        .catch(err => console.error("Failed to fetch note", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {

    setSaveStatus('saving');

    try {
      if (!noteId) { // this is a new note that's never been saved
        const newNote = await NotesService.createNote(note);

        setNoteId(newNote.id!); // track the new ID internally.

        navigate(
          `/notes/${ newNote.id }`, {
            replace: true,
            state: { disableAnimation: true }
          }
        );

      } else { // This is an existing note
        await NotesService.editNote(noteId, note);
      }
      setSaveStatus('saved');
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save note", err);
      setSaveStatus('error');
    }
  };

  useEffect(
    () => {
      if (!isDirty) return;
      if (!noteId && (!note.title || !note.content)) return;
      handleSave().then();
    },
    [debouncedNote]
  );

  const handleChange = (field: 'title' | 'content', value: string) => {
    setIsDirty(true); // Mark that we have unsaved changes
    setSaveStatus('idle'); // Reset status when the user types again
    setNote(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Seo title={ isNewNote ? "New Note" : note.title }/>

      <div className="flex flex-1 gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <input
              name="title"
              placeholder="Note Title"
              value={ note.title }
              maxLength={ 120 }
              onChange={ (e) => handleChange('title', e.target.value) }
              className="w-full h-14 text-2xl bg-transparent focus:outline-none"
            />
            <SaveStatusIndicator status={ saveStatus }/>
          </div>
          <RichTextEditor
            content={ note.content }
            onChange={ (htmlContent) => handleChange('content', htmlContent) }
          />
          <button onClick={ handleSave } className="btn self-start">
            { isNewNote ? 'Create Note' : 'Save Changes' }
          </button>
        </div>

        <aside className="w-80 border-l border-[var(--border)] p-4 hidden xl:block">
          <h3 className="font-bold">Attachments</h3>
          {/* ... Your attachments UI will go here ... */ }
        </aside>

      </div>
    </>
  );
}