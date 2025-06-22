import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type AttachmentRef, NotesService } from '../api';
import { Seo } from '../components/Seo';
import { File as FileIcon, FileImage, FileText } from 'lucide-react';
import { formatBytes } from '../utils/numbers';
import clsx from 'clsx';
import { Paginator } from '../components/Paginator';


function getFileIcon(mimeType: string = ''): React.ReactElement {
  if (mimeType.startsWith('image/')) return <FileImage size={ 24 } className="text-[var(--muted-foreground)]"/>;
  if (mimeType.startsWith('text/')) return <FileText size={ 24 } className="text-[var(--muted-foreground)]"/>;
  return <FileIcon size={ 24 } className="text-[var(--muted-foreground)]"/>;
}

function AttachmentList({ attachments, selectedId, onSelect }: {
  attachments: AttachmentRef[],
  selectedId?: string,
  onSelect: (attachmentRef: AttachmentRef) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      { attachments.map(ref => (
        <div
          key={ ref.attachment.id }
          onClick={ () => onSelect(ref) }
          className={ clsx(
            'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors toolbar-btn',
            selectedId === ref.attachment.id ? 'bg-[var(--subtle-bg)]' : 'hover:bg-[var(--subtle-bg)]'
          ) }
        >
          <div className="flex-shrink-0">{ getFileIcon(ref.attachment.mime_type) }</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{ ref.attachment.filename }</p>
            <p className="text-sm text-[var(--muted-foreground)]">{ formatBytes(ref.attachment.size || 0) }</p>
          </div>
        </div>
      )) }
    </div>
  );
}

function AttachmentDetailView({ attachmentRef }: { attachmentRef?: AttachmentRef }) {
  if (!attachmentRef) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--muted-foreground)]">
        <p>Select an attachment to see details</p>
      </div>
    );
  }
  const { attachment, note } = attachmentRef;
  return (
    <div className="p-6">
      <div className="flex items-center justify-center w-32 h-32 rounded-lg bg-[var(--subtle-bg)] mx-auto">
        { getFileIcon(attachment.mime_type) }
      </div>
      <h2 className="text-xl font-bold text-center mt-4">{ attachment.filename }</h2>
      <div className="mt-8 space-y-4">
        <div className="flex justify-between"><span
          className="font-medium text-[var(--muted-foreground)]">Size</span><span>{ formatBytes(attachment.size || 0) }</span>
        </div>
        <div className="flex justify-between"><span
          className="font-medium text-[var(--muted-foreground)]">Type</span><span>{ attachment.mime_type }</span></div>
        <div className="flex justify-between"><span
          className="font-medium text-[var(--muted-foreground)]">Parent Note</span><a href={ `/notes/${ note?.id }` }
                                                                                      className="text-[var(--accent)] underline">{ note?.title || 'Untitled' }</a>
        </div>
      </div>
    </div>
  );
}


export default function AttachmentsPage() {
  const navigate = useNavigate();
  const { attachmentId } = useParams<{ attachmentId: string }>();

  const [attachments, setAttachments] = useState<AttachmentRef[]>([]);
  const [totalAttachments, setTotalAttachments] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentRef | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchAllAttachments = useCallback(() => {
    setLoading(true);
    NotesService.getAttachments({ page: currentPage, limit: itemsPerPage })
      .then((response) => {
        setAttachments(response.attachments);
        setTotalAttachments(response.total);

        // 3. Logic to handle the selected item based on the URL
        if (attachmentId) {
          const found = response.attachments.find(ref => ref.attachment.id === attachmentId);
          setSelectedAttachment(found);
        } else if (response.attachments.length > 0) {
          // If no ID in URL, select the first item and update the URL
          const firstAttachment = response.attachments[0];
          setSelectedAttachment(firstAttachment);
          navigate(`/attachments/${ firstAttachment.attachment.id }`, { replace: true });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [currentPage, attachmentId, navigate]);

  useEffect(() => {
    fetchAllAttachments();
  }, [fetchAllAttachments]);

  const onSelectAttachment = (attachmentRef: AttachmentRef) => {
    setSelectedAttachment(attachmentRef);
    navigate(`/attachments/${ attachmentRef.attachment.id }`, { replace: true });
  };

  if (loading && attachments.length === 0) {
    return <div className="p-6">Loading attachments...</div>;
  }

  return (
    <>
      <Seo title="Attachments"/>
      <div className="flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-4 flex-shrink-0">All Attachments</h1>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">

          {/* master view */ }
          <div className="md:col-span-1 flex flex-col h-full overflow-y-auto">
            <div className="flex-1 overflow-y-auto pr-4">
              { attachments.length > 0 ? (
                <AttachmentList
                  attachments={ attachments }
                  selectedId={ selectedAttachment?.attachment.id }
                  onSelect={ onSelectAttachment } // 5. Use the new handler
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center text-[var(--muted-foreground)]">
                  <p>No attachments found.</p>
                </div>
              ) }
            </div>
            <div className="mt-auto pt-4 flex-shrink-0">
              <Paginator
                currentPage={ currentPage }
                itemsPerPage={ itemsPerPage }
                totalItems={ totalAttachments }
                onPageChange={ setCurrentPage }
              />
            </div>
          </div>

          {/* detail view */ }
          <div className="md:col-span-2 border-l border-[var(--border)] h-full overflow-y-auto">
            <AttachmentDetailView attachmentRef={ selectedAttachment }/>
          </div>
        </div>
      </div>
    </>
  );
}
