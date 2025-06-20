import type { Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  List,
  ListOrdered,
  Strikethrough
} from 'lucide-react';
import { type SaveStatus, SaveStatusIndicator } from "./SaveStatusIndicator.tsx";

type PersistentToolbarProps = {
  editor: Editor | null;
  status?: SaveStatus;
}

export function PersistentToolbar({ editor, status }: PersistentToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-[var(--border)]">
      <button
        onClick={ () => editor.chain().focus().toggleBold().run() }
        className={ `toolbar-btn ${ editor.isActive('bold') ? 'is-active' : '' }` }
      >
        <Bold size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleItalic().run() }
        className={ `toolbar-btn ${ editor.isActive('bold') ? 'is-active' : '' }` }
      >
        <Italic size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleStrike().run() }
        className={ `toolbar-btn ${ editor.isActive('strike') ? 'is-active' : '' }` }
      >
        <Strikethrough size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleCode().run() }
        className={ `toolbar-btn ${ editor.isActive('code') ? 'is-active' : '' }` }
      >
        <Code size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleHeading({ level: 1 }).run() }
        className={ `toolbar-btn ${ editor.isActive('heading', { level: 1 }) ? 'is-active' : '' }` }
      >
        <Heading1 size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleHeading({ level: 2 }).run() }
        className={ `toolbar-btn ${ editor.isActive('heading', { level: 2 }) ? 'is-active' : '' }` }
      >
        <Heading2 size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleHeading({ level: 3 }).run() }
        className={ `toolbar-btn ${ editor.isActive('heading', { level: 3 }) ? 'is-active' : '' }` }
      >
        <Heading3 size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleHeading({ level: 4 }).run() }
        className={ `toolbar-btn ${ editor.isActive('heading', { level: 4 }) ? 'is-active' : '' }` }
      >
        <Heading4 size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleBulletList().run() }
        className={ `toolbar-btn ${ editor.isActive('bulletList') ? 'is-active' : '' }` }
      >
        <List size={ 18 }/>
      </button>
      <button
        onClick={ () => editor.chain().focus().toggleOrderedList().run() }
        className={ `toolbar-btn ${ editor.isActive('orderedList') ? 'is-active' : '' }` }
      >
        <ListOrdered size={ 18 }/>
      </button>

      <div className="flex-grow"/>

      <div className="pr-2">
        <SaveStatusIndicator status={ status }/>
      </div>
    </div>
  );
}