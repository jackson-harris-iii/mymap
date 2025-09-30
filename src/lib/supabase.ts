import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnon, {
    cookies,
  });
}

export function getServerSupabase(req?: NextApiRequest, res?: NextApiResponse) {
  if (req && res) {
    return createServerClient(supabaseUrl, supabaseAnon, {
      request: req,
      response: res,
    });
  }

  return createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: false,
    },
  });
}

export function getServiceRoleSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
