import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type AttachmentOut, type NoteOut, NotesService } from "../api";
import { useDebounce } from "use-debounce";
import { SearchField } from "./SearchField.tsx";


interface SnippetPart {
  text: string;
  isMatch: boolean;
}

/**
 * Creates a "snippet" from a text, centered around the search query match.
 * It returns an array of parts, marking which part is the match.
 */
function createSnippet(text: string, query: string, contextLength: number = 80): SnippetPart[] {
  if (!text || !query) {
    return [{ text: text?.substring(0, contextLength) || '', isMatch: false }];
  }

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const matchIndex = textLower.indexOf(queryLower);

  if (matchIndex === -1) {
    return [{ text: text.substring(0, contextLength) + (text.length > contextLength ? '...' : ''), isMatch: false }];
  }

  const matchEnd = matchIndex + query.length;
  const start = Math.max(0, matchIndex - Math.floor((contextLength - query.length) / 2));
  const end = Math.min(text.length, start + contextLength);

  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';

  const parts: SnippetPart[] = [];
  if (prefix) parts.push({ text: prefix, isMatch: false });

  parts.push({ text: text.substring(start, matchIndex), isMatch: false });
  parts.push({ text: text.substring(matchIndex, matchEnd), isMatch: true });
  parts.push({ text: text.substring(matchEnd, end), isMatch: false });

  if (suffix) parts.push({ text: suffix, isMatch: false });

  return parts;
}


// --- Search Components ---

/**
 * Renders an individual search result item.
 */
function SearchResultItem({ note, query }: { note: NoteOut, query: string }) {
  const navigate = useNavigate();
  const titleSnippet = useMemo(() => createSnippet(note.title || '', query, 60), [note.title, query]);
  const contentSnippet = useMemo(() => createSnippet(note.content || '', query, 120), [note.content, query]);

  const handleItemClick = () => {
    navigate(`/notes/${ note.id }`);
  };

  return (
    <li
      onClick={ handleItemClick }
      className="p-3 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--subtle-bg)] cursor-pointer"
    >
      <div className="font-semibold text-sm truncate">
        { titleSnippet.map((part, i) =>
          part.isMatch ? <strong key={ i }>{ part.text }</strong> : <span key={ i }>{ part.text }</span>
        ) }
      </div>
      <div className="text-xs text-[var(--muted-foreground)] mt-1 truncate">
        { contentSnippet.map((part, i) =>
          part.isMatch ? <strong key={ i } className="text-[var(--foreground)]">{ part.text }</strong> :
            <span key={ i }>{ part.text }</span>
        ) }
      </div>
      { note.attachments && note.attachments.length > 0 && (
        <div className="flex gap-2 mt-2">
          { note.attachments.slice(0, 3).map((att: AttachmentOut) => (
            <span key={ att.id } className="text-xs bg-[var(--subtle-bg)] px-2 py-0.5 rounded">
              { att.filename }
            </span>
          )) }
          { note.attachments.length > 3 && <span className="text-xs">+ { note.attachments.length - 3 } more</span> }
        </div>
      ) }
    </li>
  );
}

/**
 * Renders the list of search results.
 */
function SearchResults({ results, query, isLoading }: { results: NoteOut[], query: string, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div
        className="absolute top-full mt-2 w-full bg-[var(--card-bg)] border border-[var(--border)] rounded shadow-lg z-50 p-4 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">Searching...</p>
      </div>
    );
  }

  if (query && results && results.length === 0) {
    return (
      <div
        className="absolute top-full mt-2 w-full bg-[var(--card-bg)] border border-[var(--border)] rounded shadow-lg z-50 p-4 text-center">
        <p className="text-sm">No results found for "{ query }"</p>
      </div>
    );
  }

  if (results && results.length === 0) return null;

  return (
    <ul
      className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-[var(--card-bg)] border border-[var(--border)] rounded shadow-lg z-50">
      { results.map(note => (
        <SearchResultItem key={ note.id } note={ note } query={ query }/>
      )) }
    </ul>
  );
}

/**
 * The main controller component that manages search state and API calls.
 * This is the component you will use in your AppHeader.
 */
export function SearchController() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [results, setResults] = useState<NoteOut[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await NotesService.getNotes({ q: debouncedSearchTerm, limit: 5 });
        setResults(response.notes);
      } catch (error) {
        console.error("Failed to fetch search results", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  const showResults = isFocused && searchTerm.length > 0;

  return (
    <div className="relative w-full max-w-md">
      <SearchField
        value={ searchTerm }
        onChange={ (e) => setSearchTerm(e.target.value) }
        onFocus={ () => setIsFocused(true) }
        onBlur={ () => setTimeout(() => setIsFocused(false), 150) }
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
          </svg>
        }
        placeholder="Search notes..."
      />
      { showResults && <SearchResults results={ results } query={ debouncedSearchTerm } isLoading={ isLoading }/> }
    </div>
  );
}
