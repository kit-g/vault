import { type NoteOut } from './models/NoteOut';


export const isNoteBy = (note?: NoteOut, userId?: string): boolean => {
  if (!note || !userId) {
    return false;
  }
  return note?.author.id === userId;
};

