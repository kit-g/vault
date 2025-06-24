import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import * as React from 'react';
import { Fragment, useState } from 'react';
import { NotesService, type ShareToUserRequest } from '../api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
}

export function ShareModal({ isOpen, onClose, noteId }: ShareModalProps) {
  const [recipient, setRecipient] = useState('');
  const [permission, setPermission] = useState<'read' | 'write'>('read');
  const [isLoading, setIsLoading] = useState(false);

  const onShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);


    if (!recipient) {
      toast.error("Please enter a username or email.");
      setIsLoading(false);
      return;
    }

    const requestBody: ShareToUserRequest = {
      shared_with: recipient,
      permission: permission,
    };

    try {
      await NotesService.shareNoteToUser({ noteId, requestBody });
      toast.success(`Note shared with ${ recipient }!`);
      onClose();
      setRecipient('');
    } catch (err) {
      console.error("Failed to share note", err);
      toast.error("Failed to share note. User may not exist or an error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={ isOpen } as={ Fragment }>
      <Dialog as="div" className="relative z-50" onClose={ onClose }>
        {/* The backdrop */ }
        <TransitionChild
          as={ Fragment }
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30"/>
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={ Fragment }
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full max-w-md transform overflow-hidden rounded-xl bg-[var(--background)] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <DialogTitle as="h3" className="text-lg font-bold leading-6">
                    Share Note
                  </DialogTitle>
                  <button onClick={ onClose } className="btn-icon p-1">
                    <X size={ 20 }/>
                  </button>
                </div>

                <form onSubmit={ onShare } className="mt-4">
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Invite someone to collaborate. They will be notified and the note will appear in their "Shared with
                    me" section.
                  </p>

                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="text"
                      value={ recipient }
                      onChange={ (e) => setRecipient(e.target.value.trim()) }
                      placeholder="Enter username or email..."
                      className="input-field flex-1"
                    />
                    <select
                      value={ permission }
                      onChange={
                        (e) => {
                          setPermission(e.target.value as 'read' | 'write')
                        }
                      }
                      className="input-field h-14"
                    >
                      <option value="read">Can view</option>
                      <option value="write">Can edit</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={ isLoading }
                      className="btn"
                    >
                      { isLoading ? 'Sending...' : 'Send Invite' }
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
