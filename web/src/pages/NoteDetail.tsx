import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type NoteIn, type NoteOut, NotesService, type Share } from "../api";
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
import downloadAttachment from "../utils/network.ts";
import ShareButton from "../components/ShareButton.tsx";
import { isNoteBy } from "../api/utils.ts";
import { useAuth } from "../features/AuthContext.tsx";
import { ShareModal } from "../components/ShareModal.tsx";
import { X } from "lucide-react";

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
  const { user } = useAuth();

  const [noteOut, setNoteOut] = useState<NoteOut | undefined>(undefined);
  const [debouncedNote] = useDebounce(note, 2000); // debounce the note state by 2 seconds
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(!!id);
  const [isDirty, setIsDirty] = useState(false); // if the user has made changes
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shares, setShares] = useState<Share[]>(noteOut?.shares || []);

  const getNote = async (id: string): Promise<void> => {
    return NotesService.getNote({ noteId: id })
      .then((note) => {
        setNoteOut(note);
        setShares(note?.shares || []);
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

  const isNoteMine = isNoteBy(noteOut, user?.id);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Seo title={ isNewNote ? "New Note" : note.title }/>

      {
        noteOut && (
          <ShareModal
            isOpen={ isShareModalOpen }
            onClose={
              async () => {
                setShareModalOpen(false)
                await getNote(noteId!)
              }
            }
            noteId={ noteOut.id }
          />
        )
      }

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center w-full">
              <input
                name="title"
                placeholder="Note Title"
                value={ note.title }
                maxLength={ 120 }
                onChange={ (e) => handleChange('title', e.target.value) }
                className="w-full h-14 text-2xl bg-transparent focus:outline-none"
              />
              {
                isNoteMine && noteId && (
                  <ShareButton
                    onShare={ () => setShareModalOpen(true) }
                  />
                )
              }
            </div>
          </div>
          <RichTextEditor
            isLoading={ loading }
            content={ note.content }
            onChange={ (htmlContent) => handleChange('content', htmlContent) }
            status={ saveStatus }
            onFilesSelected={ onFilesSelected }
          />
        </div>

        {/* Attachments pane */ }
        <aside { ...getRootProps() }
               className="w-80 hidden xl:flex xl:flex-col  border-l border-[var(--border)] relative "
        >
          <div className="p-4">
            <h3 className="font-bold">Attachments</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <input { ...getInputProps() } />
            { isDragActive && (
              <div
                className="absolute inset-2 flex items-center justify-center border-2 border-dashed border-[var(--accent)] bg-[var(--subtle-bg)] rounded-lg z-10">
                <p className="font-bold text-[var(--accent)]">Drop files to attach</p>
              </div>
            ) }
            {
              (!noteOut?.attachments || noteOut?.attachments.length === 0) && (uploadingFiles.length === 0)
                ? <AttachmentsEmptyState/> :
                (
                  <div className="flex flex-col gap-2">
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
                            onDownload={
                              (attachmentId) => downloadAttachment(noteId!, attachmentId)
                            }
                            onView={
                              (attachmentId) => {
                                navigate(`/attachments/${ attachmentId }`)
                              }
                            }
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
          </div>

          {
            noteId && (
              <div className="p-2 border-t border-[var(--border)] h-40">
                <h3 className="font-bold">About</h3>
                {
                  isNoteMine ? (
                    (shares?.length > 0) && (
                      <div className="mt-2">
                        <div className="text-sm">Shared with:</div>
                        <div className="mt-1 flex flex-col space-y-2">
                          {
                            shares.map(
                              (share) => {
                                return SharedItem({
                                  noteId: noteId!,
                                  share: share,
                                  onShareRevoked: () => {
                                    setShares(
                                      prev => prev.filter(s => s.with?.id !== share.with?.id)
                                    )
                                    toast.success(`Unshared with ${ share.with?.username }`)
                                  },
                                });
                              }
                            )
                          }
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="mt-2 text-sm ">
                      By { noteOut?.author.username }
                    </div>
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

function SharedItem({ noteId, share, onShareRevoked }: {
  noteId: string,
  share: Share,
  onShareRevoked: () => void,
}) {
  const unshare = async () => {
    if (share.with?.id) {
      await NotesService.revokeNoteShare({ noteId: noteId, userId: share.with?.id });
      onShareRevoked();
    }
  }
  return (
    <div
      key={ share.with?.id }
      className="text-sm flex items-center group relative pr-8"
    >
      <span>{ share.with?.username }</span>
      <div className="flex-1"/>
      {
        share.expires && (
          <span className="text-xs text-[var(--muted-foreground)]">
          until { new Date(share.expires).toLocaleDateString() }
        </span>
        )
      }
      <button
        onClick={ unshare }
        className="absolute right-0 p-1.5 rounded-full hover:bg-black/10 text-[var(--error-color)] opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete attachment"
      >
        <X size={ 16 }/>
      </button>
    </div>
  );
}

async function mimeType(file: File): Promise<string> {
  return file.type || (await fileTypeFromBlob(file))?.mime || 'binary/octet-stream'
}