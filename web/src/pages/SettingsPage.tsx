import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Camera, FileText, FileUp, Pencil, Trash2 } from 'lucide-react';
import { AuthService, type UserOut } from "../api";
import { useAuth } from "../features/AuthContext.tsx";
import axios from "axios";
import { formatBytes } from "../utils/numbers.ts";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<UserOut | null>(user);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setProfile(user);
    setIsLoading(false);
  }, [user]);

  const onFileSelect = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !user) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(`Avatar image cannot be larger than ${ formatBytes(MAX_AVATAR_SIZE_BYTES) }.`);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Preparing upload...');

    try {
      const { url } = await AuthService.presignAvatar({
        requestBody: {
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
        },
      });

      toast.loading('Uploading avatar...', { id: toastId });

      await axios.put(url, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      toast.success('Avatar updated!', { id: toastId });

      setTimeout(async () => {
        const updatedUser = await AuthService.me();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        const baseUrl = updatedUser.avatar_url?.split('?')[0];
        const cacheBustedUrl = `${ baseUrl }?v=${ new Date().getTime() }`;
        const finalUser: UserOut = {
          ...user,
          avatar_url: cacheBustedUrl,
        };

        setUser(finalUser);
        setProfile(finalUser);

        localStorage.setItem("user", JSON.stringify(finalUser));

      }, 2000);

    } catch (error) {
      console.error('Avatar upload failed', error);
      toast.error('Failed to upload avatar. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  }, [user, setUser]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileSelect,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
    noClick: false,
    noKeyboard: true,
  });

  if (isLoading) {
    return <div className="p-8">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8">Could not load profile.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div { ...getRootProps() } className="relative cursor-pointer group w-32 h-32 flex-shrink-0">
          <input { ...getInputProps() } />
          <img
            src={ profile.avatar_url || `https://i.pravatar.cc/150?u=${ profile.id }` }
            alt="User Avatar"
            className="w-full h-full rounded-full object-cover border-4 border-[var(--border)] group-hover:opacity-70 transition-opacity"
          />
          <div
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            { isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
              <Camera className="text-white" size={ 32 }/>
            ) }
          </div>
          <div
            className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full border-2 border-[var(--border)] shadow-md pointer-events-none">
            <Pencil size={ 18 } className="text-[var(--foreground)]"/>
          </div>
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h2 className="text-2xl font-semibold">{ profile.username }</h2>
          <p className="text-[var(--muted-foreground)]">{ profile.email }</p>
          { profile.created_at && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Joined on { new Date(profile.created_at).toLocaleDateString() }
            </p>
          ) }
        </div>
      </div>
      {
        isDragActive && (
          <div className="mt-4 p-8 border-2 border-dashed border-[var(--accent)] rounded-lg text-center">
            <p className="font-bold text-[var(--accent)]">Drop your new avatar here</p>
          </div>
        )
      }
      <div className="bg-[var(--subtle-bg)] p-6 rounded-lg border border-[var(--border)]">
        <h3 className="font-bold text-lg mb-4">Account Statistics</h3>
        <div className="space-y-3">
          <StatItem icon={ <FileText size={ 16 }/> } label="Notes Created" value={ profile.notes_count ?? 0 }/>
          <StatItem icon={ <FileUp size={ 16 }/> } label="Attachments" value={ profile.attachments_count ?? 0 }/>
          <StatItem icon={ <Trash2 size={ 16 }/> } label="Notes Deleted" value={ profile.deleted_notes_count ?? 0 }/>
        </div>
      </div>
    </div>
  );
}

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-start text-sm">
    <div className="text-[var(--muted-foreground)] mr-2 mt-0.5">{ icon }</div>
    <span className="text-[var(--foreground)]">{ label }</span>
    <div className="flex-1"/>
    <span className="font-medium text-[var(--foreground)]">
            { typeof value === 'number' ? new Intl.NumberFormat().format(value) : value }
        </span>
  </div>
);