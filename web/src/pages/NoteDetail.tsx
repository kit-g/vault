import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type NoteIn, type NoteOut, NotesService } from "../api";
import { Seo } from "../components/Seo";
import { RichTextEditor } from "../components/editor/RichTextEditor.tsx";
import { useDebounce } from "use-debounce";
import { type SaveStatus } from "../components/editor/SaveStatusIndicator.tsx";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { AttachmentItem } from "../components/AttachmentItem.tsx";
import { fileTypeFromBlob } from "file-type";
import { formatBytes } from "../utils/numbers.ts";
import toast from "react-hot-toast";
import { AttachmentsEmptyState } from "../components/AttachmentsEmptyState.tsx";

type UploadingFile = {
  id: string; // A unique temporary ID for the React key
  file: File;
  progress: number; // A value from 0 to 100
  status: 'uploading' | 'success' | 'error';
  error?: string;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default function NoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewNote = !id;

  const [noteId, setNoteId] = useState<string | null>(id || null);
  const [note, setNote] = useState<NoteIn>({ title: '', content: '' });
  const [noteOut, setNoteOut] = useState<NoteOut | undefined>(undefined);
  const [debouncedNote] = useDebounce(note, 2000); // debounce the note state by 2 seconds
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(!!id);
  const [isDirty, setIsDirty] = useState(false); // if the user has made changes
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const getNote = async (id: string): Promise<void> => {
    return NotesService.getNote({ noteId: id })
      .then((note) => {
        setNoteOut(note);
        setNote({ title: note.title!, content: note.content || '' });
      })
      .catch(err => console.error("Failed to fetch note", err));
  }

  useEffect(() => {
    // If this is an existing note, fetch its data
    if (id) {
      setLoading(true);
      getNote(id).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {

    setSaveStatus('saving');

    try {
      if (!noteId) { // this is a new note that's never been saved
        const newNote = await NotesService.createNote({ requestBody: note });

        setNoteId(newNote.id!); // track the new ID internally.

        navigate(
          `/notes/${ newNote.id }`, {
            replace: true,
            state: { disableAnimation: true }
          }
        );

      } else { // this is an existing note
        await NotesService.editNote({ noteId: noteId, requestBody: note });
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
    setIsDirty(true); // mark that we have unsaved changes
    setSaveStatus('idle'); // reset status when the user types again
    setNote(prev => ({ ...prev, [field]: value }));
  };

  const onFilesSelected = (files: FileList | File[]) => {
    if (!noteId) {
      alert("Please save the note before adding attachments.");
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        invalidFiles.push(`${ file.name } (${ formatBytes(file.size) })`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      toast.error(
        `File size exceeds ${ formatBytes(MAX_FILE_SIZE_BYTES) } limit.`,
        { duration: 4000 }
      );

      return;
    }

    const uploads: UploadingFile[] = Array.from(validFiles).map(
      file => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'uploading',
      })
    );

    setUploadingFiles(
      prev => [...prev, ...uploads]
    );

    const futures = uploads.map(uploadFile);


    Promise.all(futures).then(() => {
      setTimeout(async () => {
        setUploadingFiles([]);
        if (id) {
          await getNote(id);
        }
      }, 3000);
    });

  };


  const { getRootProps, getInputProps, isDragActive } = useDropzone(
    {
      onDrop: acceptedFiles => onFilesSelected(acceptedFiles),
      noClick: true,
      noKeyboard: true,
    }
  );

  const uploadFile = async (upload: UploadingFile): Promise<void> => {

    try {
      const type = await mimeType(upload.file);
      const body = {
        content_type: type,
        filename: upload.file.name,
      };
      console.log(body)

      const { url } = await NotesService.getUploadUrl({ noteId: noteId!, requestBody: body });

      if (url) {
        await axios.put(
          url,
          upload.file,
          {
            headers: { 'Content-Type': type },
            onUploadProgress: (event) => {
              const percentCompleted = Math.round((event.loaded * 100) / event.total!);
              setUploadingFiles(prev =>
                prev.map(f => f.id === upload.id ? { ...f, progress: percentCompleted } : f)
              );
            }
          }
        );

        setUploadingFiles(
          prev => prev.map(
            f => f.id === upload.id ? { ...f, status: 'success' } : f
          )
        );
      }
    } catch (err) {
      console.error("Upload failed", err);

      setUploadingFiles(
        prev => prev.map(
          f => f.id === upload.id ? { ...f, status: 'error', error: (err as Error).message } : f
        )
      );
    }
  }

  const deleteAttachment = (attachmentId: string) => {
    const request = {
      noteId: noteId!,
      attachmentId: attachmentId,
    };
    NotesService.deleteAttachment(request)
      .then(() => {
        setNoteOut(
          prev => ({
            ...prev!,
            attachments: prev!.attachments?.filter(a => a.id !== attachmentId)
          })
        );
      })
      .catch(err => console.error("Failed to delete attachment", err));
  }

  const downloadAttachment = async (attachmentId: string) => {
    try {
      const request = { noteId: noteId!, attachmentId: attachmentId, };
      const { url } = await NotesService.getDownloadUrl(request);

      console.log(url)

      if (url) {
        // create a temporary link element to trigger the download
        const link = document.createElement('a');
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Failed to download file", err);
      alert("Could not download the file.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Seo title={ isNewNote ? "New Note" : note.title }/>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <input
              name="title"
              placeholder="Note Title"
              value={ note.title }
              maxLength={ 120 }
              onChange={ (e) => handleChange('title', e.target.value) }
              className="w-full h-14 text-2xl bg-transparent focus:outline-none"
            />
          </div>
          <RichTextEditor
            isLoading={ loading }
            content={ note.content }
            onChange={ (htmlContent) => handleChange('content', htmlContent) }
            status={ saveStatus }
            onFilesSelected={ onFilesSelected }
          />
        </div>

        <aside { ...getRootProps() }
               className="w-80 border-l border-[var(--border)] p-4 hidden xl:block relative overflow-y-auto"
        >
          <input { ...getInputProps() } />
          { isDragActive && (
            <div
              className="absolute inset-2 flex items-center justify-center border-2 border-dashed border-[var(--accent)] bg-[var(--subtle-bg)] rounded-lg z-10">
              <p className="font-bold text-[var(--accent)]">Drop files to attach</p>
            </div>
          ) }
          <h3 className="font-bold">Attachments</h3>
          {
            (!noteOut?.attachments || noteOut?.attachments.length === 0) && (uploadingFiles.length === 0)
              ? <AttachmentsEmptyState/> :
              (
                <div className="flex flex-col gap-2 mt-4">
                  {
                    noteOut?.attachments?.map(
                      (attachment) => (
                        <AttachmentItem
                          attachmentId={ attachment.id }
                          key={ attachment.id }
                          name={ attachment.filename || "" }
                          status="idle"
                          mimeType={ attachment.mime_type }
                          size={ attachment.size }
                          progress={ 100 }
                          onDelete={ deleteAttachment }
                          onDownload={ downloadAttachment }
                        />
                      )
                    )
                  }
                  {
                    uploadingFiles.map(f => (
                        <AttachmentItem
                          key={ f.id }
                          name={ f.file.name }
                          status={ f.status }
                          progress={ f.progress }
                          mimeType={ f.file.type }
                          size={ f.file.size }
                          error={ f.error }
                        />
                      )
                    )
                  }
                </div>
              )
          }
        </aside>
      </div>
    </>
  );
}

async function mimeType(file: File): Promise<string> {
  return file.type || (await fileTypeFromBlob(file))?.mime || 'binary/octet-stream'
}