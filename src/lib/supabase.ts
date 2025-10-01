import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnon);
}

export function getServerSupabase(req?: NextApiRequest, res?: NextApiResponse) {
  if (req && res) {
    return createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name] || '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.setHeader('Set-Cookie', serialize(name, value, options));
          });
        },
      },
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

// Cookie serialization helper
function serialize(name: string, value: string, options: any = {}): string {
  const pairs = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge) pairs.push(`Max-Age=${options.maxAge}`);
  if (options.path) pairs.push(`Path=${options.path}`);
  if (options.domain) pairs.push(`Domain=${options.domain}`);
  if (options.expires) pairs.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) pairs.push('HttpOnly');
  if (options.secure) pairs.push('Secure');
  if (options.sameSite) pairs.push(`SameSite=${options.sameSite}`);

  return pairs.join('; ');
}
