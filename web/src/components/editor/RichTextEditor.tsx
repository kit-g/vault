import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PersistentToolbar } from "./PersistentToolbar.tsx";

interface RichTextEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  status?: 'idle' | 'saving' | 'saved' | 'error';
}

export function RichTextEditor({ content, onChange, status }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none max-w-none p-4 min-h-[40vh]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="relative border rounded-xl border-[var(--border)] bg-[var(--background)]">
      <PersistentToolbar editor={ editor } status={ status }/>
      <EditorContent editor={ editor }/>
    </div>
  );
}