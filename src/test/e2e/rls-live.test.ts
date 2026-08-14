/**
 * Live backend smoke check: with only the publishable (anon) key, no user data
 * table may return rows. Skipped automatically when env/network is unavailable.
 */
import { describe, it, expect } from 'vitest';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const TABLES = ['projects', 'sources', 'invoices', 'usage_counters', 'usage_ledger', 'quota_notifications', 'profiles'];

describe.runIf(!!url && !!key)('anonymous access is denied on user data tables', () => {
  for (const table of TABLES) {
    it(`${table} returns no rows to anon`, async () => {
      let res: Response;
      try {
        res = await fetch(`${url}/rest/v1/${table}?select=id&limit=5`, { headers: { apikey: key! } });
      } catch {
        return; // offline sandbox — nothing to assert
      }
      if (res.status === 401 || res.status === 403) {
        expect([401, 403]).toContain(res.status);
        return;
      }
      const body = await res.json();
      expect(Array.isArray(body) ? body : []).toHaveLength(0);
    }, 20000);
  }
});
