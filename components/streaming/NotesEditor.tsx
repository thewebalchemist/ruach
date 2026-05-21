import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bold, Italic, Underline, List, ListOrdered, Save, Trash2, Download, LogIn, Loader2, X } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

export default function NotesEditor() {
  const [user, setUser]                   = useState<any>(null);
  const [notes, setNotes]                 = useState<Note[]>([]);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [showPlaceholder, setPlaceholder] = useState(true);
  const [saving, setSaving]               = useState(false);
  const [showBanner, setShowBanner]       = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (user) {
      fetchCloud();
    } else {
      loadLocal();
    }
  }, [user]);

  function loadLocal() {
    try {
      const s = localStorage.getItem('ruach-notes');
      if (s) setNotes(JSON.parse(s));
    } catch {}
  }

  async function fetchCloud() {
    if (!user) return;
    const { data } = await supabase
      .from('sermon_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setNotes(data);
  }

  async function handleSave() {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    if (!content.trim() || content === '<br>') return;
    setSaving(true);

    if (user) {
      if (selectedId) {
        await supabase.from('sermon_notes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', selectedId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('sermon_notes').insert({
          content,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      await fetchCloud();
    } else {
      const note: Note = {
        id: selectedId ?? `${Date.now()}`,
        content,
        created_at: selectedId
          ? (notes.find(n => n.id === selectedId)?.created_at ?? new Date().toISOString())
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [note, ...notes.filter(n => n.id !== note.id)];
      setNotes(updated);
      localStorage.setItem('ruach-notes', JSON.stringify(updated));
      setShowBanner(true);
    }

    setSaving(false);
    clearEditor();
  }

  function clearEditor() {
    if (editorRef.current) { editorRef.current.innerHTML = ''; setPlaceholder(true); }
    setSelectedId(null);
  }

  function loadNote(note: Note) {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = note.content;
    setSelectedId(note.id);
    setPlaceholder(false);
    editorRef.current.focus();
  }

  async function deleteNote(id: string) {
    if (user) {
      await supabase.from('sermon_notes').delete().eq('id', id).eq('user_id', user.id);
      await fetchCloud();
    } else {
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      localStorage.setItem('ruach-notes', JSON.stringify(updated));
    }
    if (selectedId === id) clearEditor();
  }

  function exec(cmd: string) {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  }

  function downloadNote() {
    if (!editorRef.current?.innerText.trim()) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([editorRef.current.innerText], { type: 'text/plain' }));
    a.download = `ruach-notes-${new Date().toLocaleDateString()}.txt`;
    a.click();
  }

  function fmt(date: string) {
    return new Date(date).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <div className="p-4 space-y-3">

      {/* Login-to-sync banner */}
      {showBanner && !user && (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(191,10,48,0.1)', border: '1px solid rgba(191,10,48,0.25)' }}>
          <LogIn className="w-3.5 h-3.5 text-[#BF0A30] flex-shrink-0" />
          <p className="text-[#BF0A30] text-[11px] flex-1">Sign in to sync notes across devices</p>
          <a href="/connect" className="text-[11px] font-black text-[#BF0A30] underline flex-shrink-0" style={H}>Sign in</a>
          <button onClick={() => setShowBanner(false)} className="text-white/25 hover:text-white/60 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cloud-sync indicator */}
      {user && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-green-400 text-[11px]">Notes synced to your account</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-0.5">
          {([['bold', Bold], ['italic', Italic], ['underline', Underline]] as const).map(([cmd, Icon]) => (
            <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <List className="w-3.5 h-3.5" />
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearEditor}
            className="px-2 py-1 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white text-[10px] font-black"
            style={H}>
            NEW
          </button>
          <button onClick={downloadNote}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {showPlaceholder && (
          <div className="absolute top-3.5 left-4 text-white/20 pointer-events-none text-sm leading-relaxed">
            Take notes during the service...
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full min-h-44 p-4 text-white/85 text-sm leading-relaxed focus:outline-none"
          style={{ wordBreak: 'break-word' }}
          onFocus={() => setPlaceholder(false)}
          onBlur={e => { if (!e.currentTarget.innerHTML || e.currentTarget.innerHTML === '<br>') setPlaceholder(true); }}
          onInput={e => { setPlaceholder(!e.currentTarget.innerHTML || e.currentTarget.innerHTML === '<br>'); }}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95 disabled:opacity-50"
        style={{ background: '#BF0A30', ...H }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : selectedId ? 'Update Note' : 'Save Note'}
      </button>

      {/* Saved notes list */}
      {notes.length > 0 && (
        <div>
          <p className="text-white/25 text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={H}>
            Saved ({notes.length})
          </p>
          <div className="space-y-2">
            {notes.map(note => (
              <div
                key={note.id}
                className="rounded-xl p-3 transition-all"
                style={{
                  background: selectedId === note.id ? 'rgba(191,10,48,0.1)' : 'rgba(255,255,255,0.03)',
                  border: selectedId === note.id ? '1px solid rgba(191,10,48,0.35)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-white/30 text-[10px]">{fmt(note.created_at)}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => loadNote(note)}
                      className="text-[10px] font-black text-[#BF0A30]" style={H}>
                      {selectedId === note.id ? 'EDITING' : 'EDIT'}
                    </button>
                    <button onClick={() => deleteNote(note.id)}
                      className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div
                  className="text-white/55 text-xs line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
