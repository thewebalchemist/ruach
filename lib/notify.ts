// Notification + optional SMS utility
// Used by server-side API routes only

import { createClient } from '@supabase/supabase-js';
import { sendSMS } from './sms';

type NotificationType =
  | 'exam_result' | 'attendance' | 'warning' | 'notice' | 'event'
  | 'graduation' | 'prayer' | 'broadcast' | 'system';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Insert a row into the notifications table for a user.
 * Uses the service-role client so it bypasses RLS.
 */
export async function createNotification(
  userId:    string,
  type:      NotificationType,
  title:     string,
  body:      string,
  actionUrl?: string,
): Promise<void> {
  const { error } = await adminClient.from('notifications').insert({
    user_id:    userId,
    type,
    title,
    body,
    action_url: actionUrl ?? null,
    is_read:    false,
  });
  if (error) console.error('[notify] insert error:', error.message);
}

/**
 * Send an in-app notification and optionally an SMS.
 * `smsMessage` is used for SMS; if omitted the SMS is skipped.
 * `phone` is looked up from profiles if not supplied.
 */
export async function notifyAndSMS(opts: {
  userId:     string;
  type:       NotificationType;
  title:      string;
  body:       string;
  actionUrl?: string;
  smsMessage?: string;
  phone?:     string;
}): Promise<void> {
  await createNotification(opts.userId, opts.type, opts.title, opts.body, opts.actionUrl);

  if (!opts.smsMessage) return;

  let phone = opts.phone;
  if (!phone) {
    const { data } = await adminClient
      .from('profiles')
      .select('phone')
      .eq('id', opts.userId)
      .single();
    phone = data?.phone ?? '';
  }
  if (phone) {
    await sendSMS(phone, opts.smsMessage);
  }
}

/**
 * Notify all students in a Connect cohort who have no cohort yet
 * (waitlisted) that a new cohort is now open.
 */
export async function notifyWaitlistedStudents(cohortName: string): Promise<void> {
  const { data: students } = await adminClient
    .from('connect_students')
    .select('user_id, profiles(phone)')
    .is('cohort_id', null);

  if (!students?.length) return;

  const phones: string[] = [];

  await Promise.all(
    students.map(async (s) => {
      await createNotification(
        s.user_id,
        'notice',
        'A new Connect cohort is available!',
        `${cohortName} is now open for registration. Log in to enroll.`,
        '/connect/student',
      );
      const phone = (s as any).profiles?.phone;
      if (phone) phones.push(phone);
    }),
  );

  if (phones.length) {
    const { sendBulkSMS } = await import('./sms');
    await sendBulkSMS(
      phones,
      `Ruach Connect: A new cohort "${cohortName}" is now open. Log in to enroll: ruachtabernacle.org/connect`,
    );
  }
}
