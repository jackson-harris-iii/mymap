import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from './supabase';

export type SessionUser = {
  id: string;
  email?: string;
};

export async function requireUser(req: NextApiRequest, res: NextApiResponse): Promise<SessionUser | null> {
  const supabase = getServerSupabase(req, res);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return { id: session.user.id, email: session.user.email ?? undefined };
}
