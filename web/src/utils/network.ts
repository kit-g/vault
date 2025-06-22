import { NotesService } from "../api";
import toast from "react-hot-toast";

export default async function downloadAttachment(noteId: string, attachmentId: string): Promise<void> {
  try {
    const request = { noteId: noteId!, attachmentId: attachmentId };
    const { url } = await NotesService.getDownloadUrl(request);

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
    toast.error("Could not download the file.");
  }
}