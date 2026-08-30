import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  BookOpen, Save, Send, Clock, AlertCircle,
} from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { supabase } from '@/lib/supabase';
import type { ExamStatus } from '@/types';

type QType = 'single' | 'multi' | 'true-false';

interface DraftQuestion {
  id:             string;
  questionType:   QType;
  question:       string;
  options:        string[];
  correctAnswers: number[];
  marks:          number;
  expanded:       boolean;
}

interface Cohort  { id: string; name: string; level: number; }
interface Session { id: string; title: string; cohort_id: string; }

const BLANK = (n: number): DraftQuestion => ({
  id:             `q-new-${Date.now()}-${n}`,
  questionType:   'single',
  question:       '',
  options:        ['', '', '', ''],
  correctAnswers: [0],
  marks:          5,
  expanded:       true,
});

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

export default function NewDiscipleshipExamPage() {
  const router = useRouter();
  const { cohort: cohortParam } = router.query as { cohort?: string };

  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [cohortId,       setCohortId]       = useState(cohortParam ?? '');
  const [sessionId,      setSessionId]      = useState('');
  const [durationMin,    setDurationMin]    = useState(30);
  const [passingPct,     setPassingPct]     = useState(60);
  const [availableFrom,  setAvailableFrom]  = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [questions,      setQuestions]      = useState<DraftQuestion[]>([BLANK(0)]);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState('');

  const [cohorts,        setCohorts]        = useState<Cohort[]>([]);
  const [sessions,       setSessions]       = useState<Session[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(true);

  useEffect(() => {
    (supabase as any).from('discipleship_cohorts').select('id, name, level').order('level').order('created_at', { ascending: false })
      .then(({ data }: { data: any }) => {
        const list = (data ?? []) as Cohort[];
        setCohorts(list);
        if (!cohortId && list.length) setCohortId(cohortParam ?? list[0].id);
        setLoadingCohorts(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cohortId) return;
    (supabase as any).from('discipleship_sessions').select('id, title, cohort_id').eq('cohort_id', cohortId)
      .order('session_number', { ascending: true })
      .then(({ data }: { data: any }) => setSessions((data ?? []) as Session[]));
  }, [cohortId]);

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const passMark   = Math.round((passingPct / 100) * totalMarks);

  const addQ    = () => setQuestions(p => [...p, BLANK(p.length)]);
  const removeQ = (id: string) => setQuestions(p => p.filter(q => q.id !== id));
  const updateQ = (id: string, patch: Partial<DraftQuestion>) =>
    setQuestions(p => p.map(q => q.id === id ? { ...q, ...patch } : q));
  const toggleExpand = (id: string) =>
    setQuestions(p => p.map(q => q.id === id ? { ...q, expanded: !q.expanded } : q));
  const setOption = (qId: string, i: number, val: string) =>
    setQuestions(p => p.map(q => {
      if (q.id !== qId) return q;
      const opts = [...q.options]; opts[i] = val;
      return { ...q, options: opts };
    }));
  const changeType = (qId: string, type: QType) =>
    setQuestions(p => p.map(q => {
      if (q.id !== qId) return q;
      const options = type === 'true-false' ? ['True', 'False'] : (q.options.length === 4 ? q.options : ['', '', '', '']);
      return { ...q, questionType: type, options, correctAnswers: [0] };
    }));
  const toggleCorrect = (qId: string, i: number) =>
    setQuestions(p => p.map(q => {
      if (q.id !== qId) return q;
      if (q.questionType === 'multi') {
        const set = new Set(q.correctAnswers);
        set.has(i) ? set.delete(i) : set.add(i);
        return { ...q, correctAnswers: Array.from(set).sort() };
      }
      return { ...q, correctAnswers: [i] };
    }));

  const handleSave = async (status: ExamStatus) => {
    if (!title.trim() || !cohortId) return;
    setSaving(true);
    setSaveError('');

    try {
      const { data: exam, error: examErr } = await (supabase as any)
        .from('discipleship_exams')
        .insert({
          title,
          description:      description || null,
          cohort_id:        cohortId,
          level:            cohorts.find(c => c.id === cohortId)?.level ?? 1,
          session_id:       sessionId || null,
          duration_minutes: durationMin,
          total_marks:      totalMarks,
          passing_marks:    passMark,
          available_from:   availableFrom || null,
          available_until:  availableUntil || null,
          status,
        })
        .select('id')
        .single();

      if (examErr || !exam) throw new Error(examErr?.message ?? 'Failed to create exam');

      const qRows = questions.map((q, i) => ({
        exam_id:         exam.id,
        question_number: i + 1,
        type:            q.questionType === 'true-false' ? 'true-false' : 'multiple-choice',
        question_type:   q.questionType,
        question:        q.question,
        options:         q.options,
        correct_answer:  q.correctAnswers[0] ?? 0,
        correct_answers: q.correctAnswers,
        marks:           q.marks,
      }));

      const { error: qErr } = await (supabase as any).from('discipleship_exam_questions').insert(qRows);
      if (qErr) throw new Error(qErr.message);

      router.push('/discipleship/cohorts');
    } catch (e: unknown) {
      setSaveError((e as Error).message);
      setSaving(false);
    }
  };

  const isValid = title.trim() && cohortId && questions.every(q =>
    q.question.trim() &&
    (q.questionType === 'true-false' || q.options.every(o => o.trim())) &&
    q.correctAnswers.length > 0
  );

  return (
    <DiscipleshipLayout title="Create Exam">
      <Link href={cohortParam ? `/discipleship/cohorts/${cohortParam}` : '/discipleship/exams'}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white" style={H}>Create KDC Exam</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalMarks} total marks · {questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave('draft')} disabled={!title.trim() || saving}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium text-white/50 disabled:opacity-40 hover:border-white/10 transition-colors">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={!isValid || saving}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#A0021F] transition-colors shadow-md shadow-[#BF0A30]/20">
            <Send className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      {saveError && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Questions */}
        <div className="lg:col-span-2 space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] bg-gray-50">
                <span className="w-6 h-6 rounded-lg bg-[#BF0A30] text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={H}>
                  {idx + 1}
                </span>
                <p className="flex-1 text-sm font-medium text-white/70 truncate">
                  {q.question.trim() || 'Question text...'}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleExpand(q.id)} className="p-1.5 text-gray-400 hover:text-white/50 dark:hover:text-gray-300 rounded-lg">
                    {q.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {questions.length > 1 && (
                    <button onClick={() => removeQ(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {q.expanded && (
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Type</label>
                      <div className="flex gap-2">
                        {(['single', 'multi', 'true-false'] as QType[]).map(t => (
                          <button key={t} onClick={() => changeType(q.id, t)}
                            className={`flex-1 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                              q.questionType === t
                                ? 'border-[#BF0A30] bg-[#BF0A30]/5 text-[#BF0A30]'
                                : 'border-white/[0.06] text-gray-500'
                            }`}>
                            {t === 'single' ? 'Single' : t === 'multi' ? 'Multi-select' : 'True/False'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Marks</label>
                      <input type="number" min={1} max={20} value={q.marks}
                        onChange={e => updateQ(q.id, { marks: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-3 py-2 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white text-center focus:outline-none focus:border-[#BF0A30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Question *</label>
                    <textarea value={q.question} onChange={e => updateQ(q.id, { question: e.target.value })}
                      rows={2} placeholder="Type the question..."
                      className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white resize-none focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Options — {q.questionType === 'multi' ? 'check all correct answers' : 'select the correct one'}
                    </label>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => {
                        const isCorrect = q.correctAnswers.includes(i);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <button onClick={() => toggleCorrect(q.id, i)}
                              className={`flex-shrink-0 flex items-center justify-center transition-colors ${
                                q.questionType === 'multi'
                                  ? `w-5 h-5 rounded border-2 ${isCorrect ? 'border-green-500 bg-green-500' : 'border-white/10 dark:border-gray-600 hover:border-green-400'}`
                                  : `w-5 h-5 rounded-full border-2 ${isCorrect ? 'border-green-500 bg-green-500' : 'border-white/10 dark:border-gray-600 hover:border-green-400'}`
                              }`}>
                              {isCorrect && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                                  <path d={q.questionType === 'multi' ? 'M2 6l3 3 5-5' : undefined}
                                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                  {q.questionType !== 'multi' && <circle cx="6" cy="6" r="2" fill="white" />}
                                </svg>
                              )}
                            </button>
                            {q.questionType === 'true-false' ? (
                              <span className="flex-1 px-3 py-2 bg-[#0A0C10] border border-white/[0.06] rounded-xl text-sm text-white/50">
                                {opt}
                              </span>
                            ) : (
                              <input value={opt} onChange={e => setOption(q.id, i, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="flex-1 px-3 py-2 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button onClick={addQ}
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-white/10 dark:border-[#2D2D2D] rounded-2xl text-sm text-gray-500 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-4" style={H}>Exam Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. KDC Session 2 Quiz"
                  className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={2} placeholder="Optional description..."
                  className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white resize-none focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Cohort *</label>
                {loadingCohorts ? (
                  <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
                ) : (
                  <select value={cohortId} onChange={e => { setCohortId(e.target.value); setSessionId(''); }}
                    className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]">
                    {cohorts.length === 0 && <option value="">No cohorts found</option>}
                    {cohorts.map(c => <option key={c.id} value={c.id}>KDC {c.level} — {c.name}</option>)}
                  </select>
                )}
              </div>
              {sessions.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Linked Session (optional)</label>
                  <select value={sessionId} onChange={e => setSessionId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]">
                    <option value="">— No session link —</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Duration (minutes)</label>
                <input type="number" min={5} max={180} value={durationMin}
                  onChange={e => setDurationMin(Math.max(5, parseInt(e.target.value) || 30))}
                  className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Pass Requirement (%)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={50} max={100} step={5} value={passingPct}
                    onChange={e => setPassingPct(parseInt(e.target.value))}
                    className="flex-1 accent-[#BF0A30]"
                  />
                  <span className="text-sm font-bold text-white/70 w-10 text-right">{passingPct}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">= {passMark}/{totalMarks} marks</p>
              </div>
            </div>
          </div>

          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-4" style={H}>Availability Window</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Opens</label>
                <input type="datetime-local" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Closes</label>
                <input type="datetime-local" value={availableUntil} onChange={e => setAvailableUntil(e.target.value)}
                  className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0A0C10] rounded-2xl border border-white/[0.06]/70 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-semibold text-white/70" style={H}>Summary</p>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              {[
                ['Questions',    questions.length],
                ['Total Marks',  totalMarks],
                ['Pass Mark',    `${passMark} (${passingPct}%)`],
                ['Duration',     `${durationMin} min`],
                ['Multi-select', questions.filter(q => q.questionType === 'multi').length],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-medium text-white/70">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={() => handleSave('published')} disabled={!isValid || saving}
              className="w-full py-3 bg-[#BF0A30] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#A0021F] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#BF0A30]/20" style={H}>
              {saving ? <><Clock className="w-4 h-4 animate-spin" /> Saving...</> : <><Send className="w-4 h-4" /> Publish Exam</>}
            </button>
            <button onClick={() => handleSave('draft')} disabled={!title.trim() || saving}
              className="w-full py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium text-white/50 disabled:opacity-40 hover:border-white/10 transition-colors flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save as Draft
            </button>
          </div>
        </div>
      </div>
    </DiscipleshipLayout>
  );
}
