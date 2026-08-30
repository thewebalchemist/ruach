import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { submitAndGradeExam, type SubmitExamResult } from '@/lib/exams/submitAndGrade';

type SubmitBody = { examId: string; studentId: string; answers: Record<string, number[]>; };
type SubmitResponse = SubmitExamResult;

export default async function handler(req: NextApiRequest, res: NextApiResponse<SubmitResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, status: 405, error: 'Method not allowed' });

  const { examId, studentId, answers } = req.body as SubmitBody;
  if (!examId || !studentId || !answers) return res.status(400).json({ success: false, status: 400, error: 'Missing required fields' });

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, status: 401, error: 'Unauthorized' });

  const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !caller) return res.status(401).json({ success: false, status: 401, error: 'Unauthorized' });

  const { data: callerProfile } = await (supabaseAdmin as any).from('profiles').select('role').eq('id', caller.id).single();
  const isStaff = ['teacher', 'admin', 'pastor'].includes(callerProfile?.role ?? '');

  const result = await submitAndGradeExam({ prefix: 'discipleship', examId, studentId, answers, callerId: caller.id, isStaff });
  return res.status(result.success ? 200 : result.status).json(result);
}
