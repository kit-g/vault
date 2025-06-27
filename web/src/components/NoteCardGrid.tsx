import { type NotesResponse } from "../api";
import { NoteCard } from "./NoteCard.tsx";
import { useCallback, useEffect, useState } from "react";
import { Paginator } from "./Paginator";
import { Plus, StickyNote } from "lucide-react";


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

  if (!notes || !notes.notes || notes.notes?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="relative">
          <StickyNote className="w-16 h-16 text-gray-400"/>
          <Plus className="w-6 h-6 text-gray-400 absolute -right-1 -top-1"/>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium ">No notes yet</h3>
          <p className="text-gray-400">Create your first note to get started!</p>
        </div>
      </div>
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
          onPageChange={ (page: number) => setCurrentPage(page) }
        />
      </div>
    </div>
  );
}
 