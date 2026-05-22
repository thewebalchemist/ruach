// Achievement + points award system — server-side only

import { createClient } from '@supabase/supabase-js';
import { createNotification } from './notify';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface Achievement {
  slug:          string;
  title:         string;
  description:   string;
  icon:          string;
  points:        number;
  trigger_event: string;
}

/**
 * Award an achievement to a user if they haven't earned it yet.
 * Returns the achievement if newly earned, null if already owned.
 */
export async function awardAchievement(
  userId: string,
  slug:   string,
): Promise<Achievement | null> {
  // Fetch the achievement definition
  const { data: achievement } = await adminClient
    .from('achievements')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!achievement) return null;

  // Try to insert — unique constraint prevents duplicates
  const { error } = await adminClient.from('user_achievements').insert({
    user_id:          userId,
    achievement_slug: slug,
  });

  // 23505 = unique_violation — already earned
  if (error?.code === '23505') return null;
  if (error) {
    console.error('[achievements] insert error:', error.message);
    return null;
  }

  // Add points to profile
  await adminClient.rpc('increment_points', { user_id: userId, amount: achievement.points });

  // Also update badge_slugs array
  await adminClient
    .from('profiles')
    .update({ badge_slugs: adminClient.rpc('array_append_unique', { arr: 'badge_slugs', val: slug }) })
    .eq('id', userId);

  // In-app notification
  await createNotification(
    userId,
    'system',
    `🏆 ${achievement.title}`,
    `${achievement.description} (+${achievement.points} pts)`,
  );

  return achievement;
}

/**
 * Check attendance streak and award the 'consistent' (3-in-a-row) or
 * 'faithful_attendee' (10 total) achievement.
 */
export async function checkAndAwardAttendanceAchievements(
  userId:      string,
  cohortType:  'connect' | 'discipleship',
): Promise<Achievement[]> {
  const table      = cohortType === 'connect' ? 'connect_students' : 'discipleship_students';
  const attendTable = cohortType === 'connect' ? 'connect_attendance' : 'discipleship_attendance';

  // Get student_id
  const { data: student } = await adminClient
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (!student) return [];

  // Total attended count
  const { count: totalCount } = await adminClient
    .from(attendTable)
    .select('*', { count: 'exact', head: true })
    .eq('student_id', student.id)
    .eq('present', true);

  const earned: Achievement[] = [];

  // First class
  if (totalCount === 1) {
    const a = await awardAchievement(userId, 'first_class');
    if (a) earned.push(a);
  }

  // 10 total
  if (totalCount === 10) {
    const a = await awardAchievement(userId, 'faithful_attendee');
    if (a) earned.push(a);
  }

  // 3-in-a-row streak: get last 3 sessions ordered by date
  const { data: recentSessions } = await adminClient
    .from(attendTable)
    .select('present')
    .eq('student_id', student.id)
    .order('marked_at', { ascending: false })
    .limit(3);

  if (
    recentSessions?.length === 3 &&
    recentSessions.every(s => s.present)
  ) {
    const a = await awardAchievement(userId, 'consistent');
    if (a) earned.push(a);
  }

  return earned;
}

/**
 * Award points after an exam submission. Slug based on score.
 */
export async function awardExamAchievements(
  userId:     string,
  percentage: number,
  isFirst:    boolean,
): Promise<Achievement[]> {
  const earned: Achievement[] = [];
  if (isFirst) {
    const a = await awardAchievement(userId, 'exam_taker');
    if (a) earned.push(a);
  }
  if (percentage >= 90) {
    const a = await awardAchievement(userId, 'honour_roll');
    if (a) earned.push(a);
  }
  return earned;
}

/**
 * Award graduation achievements.
 * cohortType: 'connect' awards 'connect_graduate'
 * discipleship level awards 'kdc1_graduate', 'kdc2_graduate', 'kdc3_graduate'
 */
export async function awardGraduationAchievement(
  userId:          string,
  cohortType:      'connect' | 'discipleship',
  discipleshipLevel?: number,
): Promise<Achievement | null> {
  if (cohortType === 'connect') {
    return awardAchievement(userId, 'connect_graduate');
  }
  const slug = `kdc${discipleshipLevel ?? 1}_graduate`;
  return awardAchievement(userId, slug);
}
