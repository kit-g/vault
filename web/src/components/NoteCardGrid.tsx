import { type NotesResponse } from "../api";
import { NoteCard } from "./NoteCard.tsx";
import { useCallback, useEffect, useState } from "react";
import { Paginator } from "./Paginator.tsx";


type NoteCardGridProps = {
  hydrate: (params: { page?: number, limit?: number }) => Promise<NotesResponse>;
  onDelete?: ({ noteId }: { noteId: string }) => Promise<void>;
  onRestore?: ({ noteId }: { noteId: string }) => Promise<void>;
  onClickCard?: (noteId: string) => void;
}

const itemsPerPage = 12;

export function NoteCardGrid({ hydrate, onDelete, onRestore, onClickCard }: NoteCardGridProps) {
  const [notes, setNotes] = useState<NotesResponse>({ notes: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotes = useCallback(() => {
    setLoading(true);
    hydrate({ page: currentPage, limit: itemsPerPage })
      .then(setNotes)
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, [currentPage]);


  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{ error }</div>;

  if (!notes || notes.notes?.length === 0) {
    return (
      <p className="text-center text-gray-200 mt-10">No notes yet. Create one!</p>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {
          notes.notes?.map(
            (note) => (
              <NoteCard
                key={ note.id }
                note={ note }
                onClick={ (onClickCard && note.id) ? () => onClickCard(note.id!) : undefined }
                onDelete={
                  onDelete
                    ? async ({ noteId }) => onDelete({ noteId }).then(fetchNotes)
                    : undefined
                }
                onRestore={
                  onRestore
                    ? async (params: { noteId: string }) => onRestore(params).then(fetchNotes)
                    : undefined
                }
              />
            )
          )
        }
      </div>

      <div className="mt-auto pt-8 flex justify-center">
        <Paginator
          currentPage={ currentPage }
          totalItems={ notes.total || 0 }
          itemsPerPage={ itemsPerPage }
          onPageChange={ (page) => setCurrentPage(page) }
        />
      </div>
    </div>
  );
}
 