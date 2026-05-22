import type { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { sessionId, cohortType } = req.body as {
    sessionId:  string;
    cohortType: 'connect' | 'discipleship';
  };

  if (!sessionId || !cohortType) {
    return res.status(400).json({ message: 'sessionId and cohortType are required' });
  }

  // Verify caller is authenticated
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ message: 'Unauthorized' });

  // Fetch user profile (role + name)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(403).json({ message: 'Profile not found' });

  const isTeacher = ['teacher', 'admin', 'pastor', 'leader'].includes(profile.role);

  // Verify the session exists and user belongs to the cohort
  if (!isTeacher) {
    const sessionTable  = cohortType === 'connect' ? 'connect_sessions'  : 'discipleship_sessions';
    const studentTable  = cohortType === 'connect' ? 'connect_students'  : 'discipleship_students';

    const { data: session } = await supabase
      .from(sessionTable)
      .select('cohort_id')
      .eq('id', sessionId)
      .single();

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const { data: enrollment } = await supabase
      .from(studentTable)
      .select('id')
      .eq('user_id', user.id)
      .eq('cohort_id', session.cohort_id)
      .maybeSingle();

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this cohort' });
    }
  }

  const livekitApiKey    = process.env.LIVEKIT_API_KEY;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

  if (!livekitApiKey || !livekitApiSecret) {
    return res.status(503).json({ message: 'Classroom service not configured' });
  }

  const roomName        = `${cohortType}-${sessionId}`;
  const participantName = `${profile.first_name} ${profile.last_name}`.trim() || user.email!;
  const participantId   = user.id;

  const at = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: participantId,
    name:     participantName,
    ttl:      '4h',
  });

  at.addGrant({
    room:            roomName,
    roomJoin:        true,
    canPublish:      true,
    canSubscribe:    true,
    canPublishData:  true,
    roomAdmin:       isTeacher,
  });

  return res.status(200).json({
    token:     await at.toJwt(),
    roomName,
    serverUrl: process.env.LIVEKIT_URL ?? 'wss://your-app.livekit.cloud',
    isTeacher,
    participantName,
  });
}
