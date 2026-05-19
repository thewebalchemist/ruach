import {
    Bold,
    Download,
    Italic,
    List,
    ListOrdered,
    Save,
    Trash2,
    Underline,
  } from 'lucide-react';
  import { useEffect, useRef, useState } from 'react';
  import { Note } from '@/types';
  
  export default function NotesEditor() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState('');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const editorRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const savedNotes = localStorage.getItem('ruach-notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }, []);
  
    const saveNote = () => {
      if (!editorRef.current) return;
      
      const content = editorRef.current.innerHTML;
      if (!content.trim() || content === '<br>') return;
  
      if (selectedNoteId) {
        const updatedNotes = notes.map((note) =>
          note.id === selectedNoteId
            ? { ...note, content, updatedAt: new Date().toISOString() }
            : note
        );
        setNotes(updatedNotes);
        localStorage.setItem('ruach-notes', JSON.stringify(updatedNotes));
        alert('Note updated successfully!');
      } else {
        const newNote: Note = {
          id: Date.now().toString(),
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
  
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        localStorage.setItem('ruach-notes', JSON.stringify(updatedNotes));
        alert('Note saved successfully!');
      }
  
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        setShowPlaceholder(true);
      }
      setSelectedNoteId(null);
    };
  
    const loadNote = (note: Note) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content;
        setSelectedNoteId(note.id);
        setShowPlaceholder(false);
        editorRef.current.focus();
      }
    };
  
    const deleteNote = (noteId: string) => {
      if (confirm('Are you sure you want to delete this note?')) {
        const updatedNotes = notes.filter((note) => note.id !== noteId);
        setNotes(updatedNotes);
        localStorage.setItem('ruach-notes', JSON.stringify(updatedNotes));
        if (selectedNoteId === noteId) {
          if (editorRef.current) {
            editorRef.current.innerHTML = '';
            setShowPlaceholder(true);
          }
          setSelectedNoteId(null);
        }
      }
    };
  
    const newNote = () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        setSelectedNoteId(null);
        setShowPlaceholder(true);
        editorRef.current.focus();
      }
    };
  
    const downloadNote = () => {
      if (!editorRef.current) return;
      
      const content = editorRef.current.innerText;
      if (!content.trim()) return;
  
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ruach-notes-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  
    const executeCommand = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
    };
  
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    };
  
    return (
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => executeCommand('bold')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                title="Bold"
                type="button"
              >
                <Bold className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => executeCommand('italic')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                title="Italic"
                type="button"
              >
                <Italic className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => executeCommand('underline')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                title="Underline"
                type="button"
              >
                <Underline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />
              <button
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                title="Bullet List"
                type="button"
              >
                <List className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => executeCommand('insertOrderedList')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                title="Numbered List"
                type="button"
              >
                <ListOrdered className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={newNote}
                className="px-4 py-2 text-sm font-medium text-[#BF0A30] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                type="button"
              >
                New Note
              </button>
              <button
                onClick={downloadNote}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                title="Download"
                type="button"
              >
                <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
  
        {/* WYSIWYG Editor */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden relative">
          {/* Placeholder */}
          {showPlaceholder && (
            <div className="absolute top-6 left-6 text-gray-400 dark:text-gray-600 pointer-events-none text-base">
              Take notes during the service...
            </div>
          )}
          
          <div
            ref={editorRef}
            contentEditable
            className="w-full min-h-96 max-h-96 overflow-y-auto p-6 bg-transparent text-gray-900 dark:text-white focus:outline-none"
            style={{ 
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
            onFocus={() => setShowPlaceholder(false)}
            onBlur={(e) => {
              if (!e.currentTarget.innerHTML || e.currentTarget.innerHTML === '<br>') {
                setShowPlaceholder(true);
              }
            }}
            onInput={(e) => {
              if (e.currentTarget.innerHTML === '<br>' || !e.currentTarget.innerHTML) {
                setShowPlaceholder(true);
              } else {
                setShowPlaceholder(false);
              }
            }}
          />
        </div>
  
        {/* Action Buttons */}
        <div className="flex space-x-3">
          {selectedNoteId && (
            <button
              onClick={newNote}
              className="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-[2rem] font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              type="button"
            >
              Clear
            </button>
          )}
          <button
            onClick={saveNote}
            className="flex-1 px-6 py-4 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg"
            type="button"
          >
            <Save className="w-5 h-5" />
            <span>{selectedNoteId ? 'Update Note' : 'Save Note'}</span>
          </button>
        </div>
  
        {/* Saved Notes */}
        {notes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
              Saved Notes ({notes.length})
            </h3>
            {notes.map((note) => (
              <div
                key={note.id}
                className={`bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-lg border-2 transition-all ${
                  selectedNoteId === note.id
                    ? 'border-[#BF0A30]'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(note.createdAt)}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-2">(edited)</span>
                    )}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadNote(note)}
                      className="text-sm text-[#BF0A30] hover:text-[#9a0826] font-medium"
                      type="button"
                    >
                      {selectedNoteId === note.id ? 'Editing' : 'Edit'}
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-sm text-gray-500 hover:text-red-600 font-medium"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }