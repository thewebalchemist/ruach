import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle, BookOpen, Save, Send, Clock
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { mockConnectCohorts, mockConnectSessions } from '@/data/connect';
import { ExamQuestion, QuestionType, ExamStatus } from '@/types';

interface DraftQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  expanded: boolean;
}

const BLANK_QUESTION = (n: number): DraftQuestion => ({
  id: `q-new-${Date.now()}-${n}`,
  type: 'multiple-choice',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  marks: 5,
  expanded: true,
});

export default function NewExamPage() {
  const router = useRouter();
  const { cohort: cohortParam } = router.query as { cohort?: string };

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [cohortId,       setCohortId]       = useState(cohortParam ?? mockConnectCohorts[0]?.id ?? '');
  const [sessionId,      setSessionId]      = useState('');
  const [durationMin,    setDurationMin]    = useState(30);
  const [passingMarks,   setPassingMarks]   = useState(60);  // % used to derive passingMarks
  const [availableFrom,  setAvailableFrom]  = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [questions,      setQuestions]      = useState<DraftQuestion[]>([BLANK_QUESTION(0)]);
  const [saving,         setSaving]         = useState(false);

  const sessions  = mockConnectSessions.filter(s => s.cohortId === cohortId);
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const passMark   = Math.round((passingMarks / 100) * totalMarks);

  // ── Question helpers ────────────────────────────────────────────────────────
  const addQuestion = () =>
    setQuestions(prev => [...prev, BLANK_QUESTION(prev.length)]);

  const removeQuestion = (id: string) =>
    setQuestions(prev => prev.filter(q => q.id !== id));

  const updateQ = (id: string, patch: Partial<DraftQuestion>) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));

  const toggleExpand = (id: string) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, expanded: !q.expanded } : q));

  const setOption = (qId: string, i: number, val: string) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const opts = [...q.options];
      opts[i] = val;
      return { ...q, options: opts };
    }));

  const changeType = (qId: string, type: QuestionType) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const options = type === 'true-false' ? ['True', 'False'] : ['', '', '', ''];
      return { ...q, type, options, correctAnswer: 0 };
    }));

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (status: ExamStatus) => {
    if (!title.trim() || !cohortId) return;
    setSaving(true);
    // In production: POST /api/connect/exams
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    router.push(`/connect/cohorts/${cohortId}`);
  };

  const isValid = title.trim() && cohortId && questions.every(q =>
    q.question.trim() &&
    (q.type === 'true-false' || q.options.every(o => o.trim()))
  );

  return (
    <ConnectLayout title="Create Exam">
      <Link href={cohortParam ? `/connect/cohorts/${cohortParam}` : '/connect/exams'} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Exam</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalMarks} total marks · {questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={!title.trim() || saving}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-gray-300 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={!isValid || saving}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#A0021F] transition-colors shadow-md shadow-[#BF0A30]/20"
          >
            <Send className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left: Questions ── */}
        <div className="lg:col-span-2 space-y-4">

          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] shadow-sm overflow-hidden">

              {/* Question header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/[0.04] bg-gray-50 dark:bg-[#1A1A1A]">
                <span className="w-6 h-6 rounded-lg bg-[#BF0A30] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {q.question.trim() || 'Question text...'}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleExpand(q.id)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                    {q.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {q.expanded && (
                <div className="p-5 space-y-4">
                  {/* Type + marks row */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Type</label>
                      <div className="flex gap-2">
                        {(['multiple-choice', 'true-false'] as QuestionType[]).map(t => (
                          <button
                            key={t}
                            onClick={() => changeType(q.id, t)}
                            className={`flex-1 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                              q.type === t
                                ? 'border-[#BF0A30] bg-[#BF0A30]/5 text-[#BF0A30]'
                                : 'border-gray-200 dark:border-white/[0.06] text-gray-500'
                            }`}
                          >
                            {t === 'multiple-choice' ? 'Multiple Choice' : 'True / False'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Marks</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={q.marks}
                        onChange={e => updateQ(q.id, { marks: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:border-[#BF0A30]"
                      />
                    </div>
                  </div>

                  {/* Question text */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Question *</label>
                    <textarea
                      value={q.question}
                      onChange={e => updateQ(q.id, { question: e.target.value })}
                      rows={2}
                      placeholder="Type the question..."
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Options — select the correct one
                    </label>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {/* Radio selector = correct answer */}
                          <button
                            onClick={() => updateQ(q.id, { correctAnswer: i })}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              q.correctAnswer === i
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                            }`}
                            title="Mark as correct answer"
                          >
                            {q.correctAnswer === i && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </button>
                          {q.type === 'true-false' ? (
                            <span className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm text-gray-600 dark:text-gray-400">
                              {opt}
                            </span>
                          ) : (
                            <input
                              value={opt}
                              onChange={e => setOption(q.id, i, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                              className="flex-1 px-3 py-2 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Click the circle next to the correct answer.</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add question button */}
          <button
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-300 dark:border-[#2D2D2D] rounded-2xl text-sm text-gray-500 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* ── Right: Settings ── */}
        <div className="space-y-4">

          {/* Exam details */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Exam Details</h3>
            <div className="space-y-3">

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Session 2 Quiz"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional description..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Cohort *</label>
                <select
                  value={cohortId}
                  onChange={e => { setCohortId(e.target.value); setSessionId(''); }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                >
                  {mockConnectCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {sessions.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Linked Session (optional)</label>
                  <select
                    value={sessionId}
                    onChange={e => setSessionId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                  >
                    <option value="">— No session link —</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMin}
                  onChange={e => setDurationMin(Math.max(5, parseInt(e.target.value) || 30))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Pass Requirement (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={5}
                    value={passingMarks}
                    onChange={e => setPassingMarks(parseInt(e.target.value))}
                    className="flex-1 accent-[#BF0A30]"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-10 text-right">{passingMarks}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">= {passMark}/{totalMarks} marks</p>
              </div>
            </div>
          </div>

          {/* Availability window */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Availability Window</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Opens</label>
                <input
                  type="datetime-local"
                  value={availableFrom}
                  onChange={e => setAvailableFrom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Closes</label>
                <input
                  type="datetime-local"
                  value={availableUntil}
                  onChange={e => setAvailableUntil(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Summary</p>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between"><span>Questions</span><span className="font-medium text-gray-700 dark:text-gray-300">{questions.length}</span></div>
              <div className="flex justify-between"><span>Total Marks</span><span className="font-medium text-gray-700 dark:text-gray-300">{totalMarks}</span></div>
              <div className="flex justify-between"><span>Pass Mark</span><span className="font-medium text-gray-700 dark:text-gray-300">{passMark} ({passingMarks}%)</span></div>
              <div className="flex justify-between"><span>Duration</span><span className="font-medium text-gray-700 dark:text-gray-300">{durationMin} min</span></div>
            </div>
          </div>

          {/* Bottom action buttons (repeated for convenience) */}
          <div className="space-y-2">
            <button
              onClick={() => handleSave('published')}
              disabled={!isValid || saving}
              className="w-full py-3 bg-[#BF0A30] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#A0021F] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#BF0A30]/20"
            >
              {saving ? <><Clock className="w-4 h-4 animate-spin" /> Saving...</> : <><Send className="w-4 h-4" /> Publish Exam</>}
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={!title.trim() || saving}
              className="w-full py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save as Draft
            </button>
          </div>
        </div>
      </div>
    </ConnectLayout>
  );
}