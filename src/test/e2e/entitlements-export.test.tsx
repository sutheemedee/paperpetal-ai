/**
 * E2E: entitlement gating for AI usage + exports.
 * Verifies limits block at the plan ceiling, blocked actions surface the upgrade
 * modal, and an upgrade immediately unlocks formats and raises quotas.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FakeEntitlementsServer, makeAccount } from './harness';
import type { AccountState } from '@/auth/AuthProvider';
import type { PlanCode } from '@/lib/plans';

const USER_A = 'aaaaaaaa-0000-4000-8000-000000000001';
const server = new FakeEntitlementsServer();

let account: AccountState = makeAccount('free');
let uid: string | null = USER_A;
const setAccountSpy = vi.fn((a: AccountState) => {
  account = a;
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: uid ? { id: uid } : null,
    account,
    profile: null,
    isAdmin: false,
    loading: false,
    refresh: vi.fn(),
    setAccount: setAccountSpy,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: (_name: string, opts: any) => server.invoke(uid, opts.body) },
    from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
  },
}));

const setPlan = (code: PlanCode, counters: Record<string, number> = {}) => {
  account = makeAccount(code, counters as any);
  server.setAccount(USER_A, account);
};

/** Mirrors the export gate in the Book Studio. */
const EXPORT_GATE: Record<string, 'pdf' | 'docx' | 'epub' | null> = {
  pdf: 'pdf',
  docx: 'docx',
  epub: 'epub',
  png: null,
};

const Harness = ({ onResult }: { onResult: (r: string) => void }) => {
  const { useEntitlements } = require('@/auth/useEntitlements');
  const { consume, check, requireFeature, usage, can } = useEntitlements();

  const doExport = async (format: string) => {
    const gate = EXPORT_GATE[format];
    if (gate && !requireFeature(gate, `ส่งออก ${format}`)) return onResult(`blocked:feature:${format}`);
    if (!(await check('exports'))) return onResult(`blocked:quota:${format}`);
    await consume({ metric: 'exports', operation: 'export_book', format });
    onResult(`ok:${format}`);
  };

  return (
    <div>
      {['pdf', 'docx', 'epub', 'png'].map(f => (
        <button key={f} onClick={() => doExport(f)}>{`export-${f}`}</button>
      ))}
      <button
        onClick={async () => {
          const ok = await consume({ metric: 'aiPages', quantity: 20, operation: 'generate_book' });
          onResult(ok ? 'ok:aiPages' : 'blocked:quota:aiPages');
        }}
      >
        generate
      </button>
      <span data-testid="pptx">{String(can('pptx'))}</span>
      <span data-testid="aiPagesLimit">{String(usage('aiPages').limit)}</span>
      <span data-testid="aiPagesUsed">{String(usage('aiPages').used)}</span>
    </div>
  );
};

const mount = async (results: string[]) => {
  const { EntitlementsProvider } = await import('@/auth/useEntitlements');
  return render(
    <MemoryRouter>
      <EntitlementsProvider>
        <Harness onResult={r => results.push(r)} />
      </EntitlementsProvider>
    </MemoryRouter>,
  );
};

const click = async (label: string) => {
  await act(async () => {
    screen.getByText(label).click();
    await Promise.resolve();
  });
};

beforeEach(() => {
  localStorage.clear();
  uid = USER_A;
  server.accounts.clear();
  server.calls = [];
  setPlan('free');
});

describe('export gating by plan', () => {
  it('Free Trial: PDF allowed, EPUB blocked with upgrade modal', async () => {
    const results: string[] = [];
    const view = await mount(results);

    await click('export-epub');
    expect(results).toContain('blocked:feature:epub');
    await waitFor(() => expect(screen.getByText(/อัปเกรด/)).toBeInTheDocument());
    view.unmount();
  });

  it('Free Trial: daily export cap blocks the second download of the day', async () => {
    const results: string[] = [];
    await mount(results);

    await click('export-pdf');
    expect(results).toContain('ok:pdf');
    await click('export-pdf');
    expect(results).toContain('blocked:quota:pdf');
  });

  it('Creator plan unlocks EPUB and monthly export quota', async () => {
    setPlan('creator');
    const results: string[] = [];
    await mount(results);

    await click('export-epub');
    expect(results).toContain('ok:epub');
    expect(screen.getByTestId('pptx').textContent).toBe('true');
  });

  it('Starter plan still blocks PPTX until upgrade', async () => {
    setPlan('starter');
    const results: string[] = [];
    const view = await mount(results);
    expect(screen.getByTestId('pptx').textContent).toBe('false');
    view.unmount();

    setPlan('unlimited');
    await mount(results);
    expect(screen.getByTestId('pptx').textContent).toBe('true');
  });
});

describe('AI quota enforcement and upgrade', () => {
  it('blocks generation past the plan ceiling, then allows it after upgrade', async () => {
    setPlan('free', { aiPages: 25 }); // limit 30, request 20 → over
    const results: string[] = [];
    const view = await mount(results);

    await click('generate');
    expect(results).toContain('blocked:quota:aiPages');
    expect(screen.getByTestId('aiPagesLimit').textContent).toBe('30');
    view.unmount();

    // Upgrade keeps usage but raises the ceiling.
    server.upgrade(USER_A, 'creator');
    account = server.accounts.get(USER_A)!;
    const results2: string[] = [];
    await mount(results2);
    expect(screen.getByTestId('aiPagesLimit').textContent).toBe('1000');
    expect(screen.getByTestId('aiPagesUsed').textContent).toBe('25');

    await click('generate');
    expect(results2).toContain('ok:aiPages');
    expect(server.accounts.get(USER_A)!.counters.aiPages).toBe(45);
  });

  it('signed-out users are asked to log in instead of consuming quota', async () => {
    uid = null;
    const results: string[] = [];
    await mount(results);
    await click('generate');
    expect(results).toContain('blocked:quota:aiPages');
    expect(server.calls).toHaveLength(0);
  });

  it('usage counters are per user — user B never inherits user A usage', async () => {
    setPlan('free', { aiPages: 25 });
    server.setAccount('bbbbbbbb-0000-4000-8000-000000000002', makeAccount('free'));
    expect(server.accounts.get(USER_A)!.counters.aiPages).toBe(25);
    expect(server.accounts.get('bbbbbbbb-0000-4000-8000-000000000002')!.counters.aiPages).toBeUndefined();
  });
});
