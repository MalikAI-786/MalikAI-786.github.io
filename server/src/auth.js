import crypto from 'node:crypto';
import { pool } from './db.js';

/** 32 random bytes, base64url. Shown once, at mint time, and never stored. */
export function mintToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashToken(tok) {
  return crypto.createHash('sha256').update(tok, 'utf8').digest();
}

/**
 * Resolve a bearer/cookie token to a person.
 *
 * Only the hash is stored, so a database dump does not yield working links.
 * Lookup is by hash equality on an indexed unique column — the timing of a
 * miss and a hit are not meaningfully different, and the token has 256 bits
 * of entropy, so there is nothing to guess at.
 *
 * Runs OUTSIDE asPerson necessarily: identity must be established before an
 * identity can be set. access_tokens is athlete-only under RLS, so the lookup
 * goes through resolve_access_token(), a SECURITY DEFINER function that takes
 * the hash and returns nothing else. Querying the table directly from here
 * silently returns zero rows — RLS is doing its job, and it looks exactly
 * like a bad token.
 */
export async function resolveToken(tok) {
  if (!tok || typeof tok !== 'string' || tok.length < 20) return null;
  const { rows } = await pool.query(
    'SELECT * FROM resolve_access_token($1)', [hashToken(tok)]);
  return rows[0] ?? null;
}

export function readCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1));
  }
  return null;
}

export function sessionCookie(tok, secure) {
  // httpOnly: script on the page must never be able to read it.
  // SameSite=Lax: the coach arrives by clicking a link, which Lax allows,
  // while a cross-site POST cannot ride along on it.
  return `mz=${encodeURIComponent(tok)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
       + (secure ? '; Secure' : '');
}
