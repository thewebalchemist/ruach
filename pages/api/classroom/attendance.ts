import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient }          from '@supabase/supabase-js';
import { checkAndAwardAttendanceAchievements } from '@/lib/achievements';
import { createNotification }    from '@/lib/notify';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, sessionId, cohortType } = req.body as {
    userId:     string;
    sessionId:  string;
    cohortType: 'connect' | 'discipleship';
  };

  if (!userId || !sessionId || !cohortType) {
    return res.status(400).json({ message: 'userId, sessionId, and cohortType are required' });
  }

  const studentTable  = cohortType === 'connect' ? 'connect_students'  : 'discipleship_students';
  const attendTable   = cohortType === 'connect' ? 'connect_attendance': 'discipleship_attendance';

  // Find student record
  const { data: student } = await adminClient
    .from(studentTable)
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Upsert attendance
  const { error } = await adminClient.from(attendTable).upsert(
    { student_id: student.id, session_id: sessionId, present: true, marked_at: new Date().toISOString() },
    { onConflict: 'student_id,session_id' },
  );

  if (error) {
    console.error('[attendance] upsert error:', error.message);
    return res.status(500).json({ message: 'Failed to record attendance' });
  }

  // Notify student
  await createNotification(
    userId,
    'attendance',
    'Attendance recorded',
    'You\'ve been marked as present for today\'s session. Keep it up!',
  );

  // Check and award achievement (don't block the response)
  const earned = await checkAndAwardAttendanceAchievements(userId, cohortType);

  return res.status(200).json({ success: true, achievementsEarned: earned });
}
