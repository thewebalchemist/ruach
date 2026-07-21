import { useEffect, useState } from 'react';
import { Sparkles, Save, Plus, Trash2, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';
import { invalidateKnowledgeCache } from '@/lib/knowledge';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  order_index: number;
  category?: string;
}

interface CommonQA {
  id: string;
  question: string;
  answer: string;
}

const HARDCODED_QA: CommonQA[] = [
  { id: 'hq1', question: 'What time are your Sunday services?', answer: 'We have three Sunday services: First Service at 8:00 AM – 9:30 AM, Second Service at 10:00 AM – 12:00 PM, and Third Service at 12:30 PM – 2:00 PM.' },
  { id: 'hq2', question: 'Where is Ruach Tabernacle located?', answer: 'We are located at Rhema Grounds, Rhema Avenue, off Northern Bypass Road, next to Shell Windsor, Nairobi, Kenya.' },
  { id: 'hq3', question: 'How do I join Connect Class?', answer: 'Connect Class is our official onboarding program. You can register at ruachtabernacle.org/connect/register. Classes run in terms and cover everything about our faith, church, and community.' },
  { id: 'hq4', question: 'What is a Crosspoint?', answer: 'Crosspoints are our home churches — small weekly gatherings of 15-30 people organized by geographic zone (North, South, East, West). Every member is encouraged to join one to grow in community.' },
  { id: 'hq5', question: 'How do I give online?', answer: 'You can give through our website at ruachtabernacle.org/give. We accept M-Pesa and card payments. Your giving supports the mission of the church.' },
  { id: 'hq6', question: 'Do you have programs for children?', answer: 'Yes! R-Kids Church runs during all Sunday services with age-appropriate teaching, games, and activities. All volunteers are thoroughly vetted for your children\'s safety.' },
];

const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

export default function AskRuachConfig() {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'hardcoded' | 'faqs'>('hardcoded');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });
  const [addingFaq, setAddingFaq] = useState(false);
  const [cacheFlushing, setCacheFlushing] = useState(false);
  const [cacheFlushed, setCacheFlushed] = useState(false);

  // Auth + role gating handled centrally by CPLayout (allow=admin,pastor).
  useEffect(() => { loadFAQs(); }, []);

  async function loadFAQs() {
    const { data } = await (supabase.from('faqs') as any).select('*').order('order_index', { ascending: true });
    setFaqs(data || []);
    setLoading(false);
  }

  async function toggleFAQ(id: number, is_active: boolean) {
    await (supabase.from('faqs') as any).update({ is_active: !is_active }).eq('id', id);
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, is_active: !is_active } : f));
  }

  async function deleteFAQ(id: number) {
    if (!confirm('Delete this FAQ?')) return;
    await (supabase.from('faqs') as any).delete().eq('id', id);
    setFaqs(prev => prev.filter(f => f.id !== id));
  }

  async function saveFAQ(faq: FAQ) {
    setSaving(true); setError('');
    const { error: e } = await (supabase.from('faqs') as any)
      .update({ question: faq.question, answer: faq.answer })
      .eq('id', faq.id);
    setSaving(false);
    if (e) { setError(e.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function addFAQ() {
    if (!newFaq.question || !newFaq.answer) { setError('Question and answer are required.'); return; }
    setAddingFaq(true); setError('');
    const maxOrder = Math.max(...faqs.map(f => f.order_index), 0);
    const { error: e } = await (supabase.from('faqs') as any).insert({
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category,
      is_active: true,
      order_index: maxOrder + 1,
    });
    setAddingFaq(false);
    if (e) { setError(e.message); return; }
    setNewFaq({ question: '', answer: '', category: 'general' });
    loadFAQs();
  }

  async function flushCache() {
    setCacheFlushing(true);
    invalidateKnowledgeCache();
    await new Promise(r => setTimeout(r, 500));
    setCacheFlushing(false);
    setCacheFlushed(true);
    setTimeout(() => setCacheFlushed(false), 3000);
  }

  return (
    <CPLayout
      title="Ask Ruach Configuration"
      subtitle="Configure what the AI knows about your church"
      allow={['admin', 'pastor']}
      actions={
        <button
          onClick={flushCache}
          disabled={cacheFlushing}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#2A2A2A] text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
        >
          {cacheFlushing ? <Loader2 className="w-4 h-4 animate-spin" /> : cacheFlushed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <RefreshCw className="w-4 h-4" />}
          {cacheFlushed ? 'Cache flushed!' : 'Flush AI Cache'}
        </button>
      }
    >
      <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl px-5 py-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">How Ask Ruach works</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Ask Ruach AI answers questions using two sources: (1) <strong>hardcoded common Q&A</strong> — fast, always available answers to the most frequent questions; and (2) <strong>live database FAQs</strong> — dynamic answers fetched from Supabase, cached for 1 hour. Use "Flush AI Cache" to apply FAQ changes immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-xl p-1 mb-6 w-fit">
        {(['hardcoded', 'faqs'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${activeSection === s ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {s === 'hardcoded' ? '⚡ Common Q&A (Fast)' : '📋 FAQ Database'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" /></div>
      ) : activeSection === 'hardcoded' ? (

        /* Hardcoded Q&A section */
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Common Q&A — Always Fast</h2>
              <p className="text-xs text-gray-500 mt-0.5">These are built into the AI system prompt — zero database latency. Edit in code: <code className="bg-gray-100 dark:bg-[#222] px-1 rounded text-[11px]">lib/knowledge.ts</code></p>
            </div>
          </div>
          <div className="space-y-3">
            {HARDCODED_QA.map(qa => (
              <div key={qa.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{qa.question}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{qa.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-[#222] px-5 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">To add or edit fast Q&A</strong>, update the <code className="bg-white dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded text-xs border border-gray-200 dark:border-[#333]">buildSystemPrompt()</code> function in <code className="bg-white dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded text-xs border border-gray-200 dark:border-[#333]">lib/knowledge.ts</code>. These are injected directly into every AI request.
            </p>
          </div>
        </div>

      ) : (

        /* FAQ Database section */
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">FAQ Database</h2>
            <p className="text-xs text-gray-500 mt-0.5">These are fetched from Supabase and cached for 1 hour. Active FAQs are shown to the AI.</p>
          </div>

          {/* Add FAQ form */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Add New FAQ</h3>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Question</label>
                <input value={newFaq.question} onChange={e => setNewFaq(f => ({ ...f, question: e.target.value }))} placeholder="e.g. What is Connect Class?" className={inp} />
              </div>
              <div>
                <label className={lbl}>Answer</label>
                <textarea value={newFaq.answer} onChange={e => setNewFaq(f => ({ ...f, answer: e.target.value }))} rows={3} placeholder="Write the answer…" className={`${inp} resize-none`} />
              </div>
              <div className="flex items-center gap-3">
                <select value={newFaq.category} onChange={e => setNewFaq(f => ({ ...f, category: e.target.value }))} className={`${inp} flex-1`}>
                  <option value="general">General</option>
                  <option value="services">Services</option>
                  <option value="connect">Connect Class</option>
                  <option value="crosspoints">Crosspoints</option>
                  <option value="giving">Giving</option>
                  <option value="kids">Kids Church</option>
                </select>
                <button onClick={addFAQ} disabled={addingFaq} className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
                  {addingFaq ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add FAQ
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            {faqs.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] py-12 text-center">
                <p className="text-sm text-gray-400">No FAQs in the database yet. Add one above.</p>
              </div>
            ) : faqs.map(faq => (
              <EditableFAQ key={faq.id} faq={faq} onToggle={toggleFAQ} onDelete={deleteFAQ} onSave={saveFAQ} />
            ))}
          </div>
        </div>
      )}
    </CPLayout>
  );
}

function EditableFAQ({ faq, onToggle, onDelete, onSave }: {
  faq: FAQ;
  onToggle: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
  onSave: (faq: FAQ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState(faq.question);
  const [a, setA] = useState(faq.answer);
  const [editing, setEditing] = useState(false);

  const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";

  return (
    <div className={`bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden ${!faq.is_active ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => onToggle(faq.id, faq.is_active)}
          className={`w-8 h-5 rounded-full transition-colors relative flex-shrink-0 ${faq.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#333]'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${faq.is_active ? 'translate-x-3' : 'translate-x-0.5'}`} />
        </button>
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">{faq.question}</span>
        {faq.category && <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded-full hidden sm:inline">{faq.category}</span>}
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button onClick={() => onDelete(faq.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 dark:border-[#222] pt-3 space-y-3">
          {editing ? (
            <>
              <input value={q} onChange={e => setQ(e.target.value)} className={inp} />
              <textarea value={a} onChange={e => setA(e.target.value)} rows={3} className={`${inp} resize-none`} />
              <div className="flex gap-2">
                <button onClick={() => { onSave({ ...faq, question: q, answer: a }); setEditing(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#BF0A30] text-white text-xs font-semibold rounded-lg">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => { setQ(faq.question); setA(faq.answer); setEditing(false); }}
                  className="px-3 py-1.5 border border-gray-200 dark:border-[#333] text-xs text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222]">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
              <button onClick={() => setEditing(true)} className="text-xs text-[#BF0A30] font-medium hover:underline">Edit →</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
