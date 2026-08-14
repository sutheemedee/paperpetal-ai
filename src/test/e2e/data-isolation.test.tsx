/**
 * E2E: strict per-user data isolation.
 * User A must never see User B's projects, sources or local knowledge store.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FakeRlsTable } from './harness';

const USER_A = { id: 'aaaaaaaa-0000-4000-8000-000000000001', email: 'a@paperpetal.test' };
const USER_B = { id: 'bbbbbbbb-0000-4000-8000-000000000002', email: 'b@paperpetal.test' };

const projects = new FakeRlsTable<{ id: string; user_id: string; name: string; kind: string; archived: boolean; updated_at: string }>();
const sources = new FakeRlsTable<{ id: string; user_id: string; title: string }>();

let currentUid: string | null = USER_A.id;

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      const store = table === 'projects' ? projects : sources;
      const result = () => ({ data: store.selectAs(currentUid), error: null });
      const chain: any = {
        select: () => chain,
        order: () => Promise.resolve(result()),
        eq: () => Promise.resolve(result()),
        then: (fn: any) => Promise.resolve(result()).then(fn),
      };
      return chain;
    },
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));

beforeEach(() => {
  projects.rows = [];
  sources.rows = [];
  localStorage.clear();
  currentUid = USER_A.id;
  projects.insert({ id: 'p-a', user_id: USER_A.id, name: 'หนังสือของ A', kind: 'book', archived: false, updated_at: '2026-08-01' });
  projects.insert({ id: 'p-b', user_id: USER_B.id, name: 'หนังสือของ B', kind: 'book', archived: false, updated_at: '2026-08-02' });
  sources.insert({ id: 's-a', user_id: USER_A.id, title: 'แหล่งข้อมูลของ A' });
  sources.insert({ id: 's-b', user_id: USER_B.id, title: 'แหล่งข้อมูลของ B' });
});

describe('row-level isolation (projects & sources)', () => {
  it('user A reads only their own projects', () => {
    expect(projects.selectAs(USER_A.id).map(r => r.id)).toEqual(['p-a']);
  });

  it('user B never sees user A rows', () => {
    expect(projects.selectAs(USER_B.id).map(r => r.id)).toEqual(['p-b']);
    expect(sources.selectAs(USER_B.id).map(r => r.title)).toEqual(['แหล่งข้อมูลของ B']);
  });

  it('anonymous callers read nothing', () => {
    expect(projects.selectAs(null)).toHaveLength(0);
    expect(sources.selectAs(null)).toHaveLength(0);
  });

  it('user A cannot delete user B rows', () => {
    expect(projects.deleteAs(USER_A.id, 'p-b')).toBe(0);
    expect(projects.selectAs(USER_B.id)).toHaveLength(1);
    expect(projects.deleteAs(USER_B.id, 'p-b')).toBe(1);
  });
});

describe('Projects page renders only the signed-in user data', () => {
  it('shows A projects for A and B projects for B', async () => {
    vi.doMock('@/auth/AuthProvider', () => ({
      useAuth: () => ({ user: { id: currentUid }, account: null, profile: null, refresh: vi.fn(), isAdmin: false, loading: false }),
    }));
    vi.doMock('@/components/AppShell', () => ({ default: ({ children }: any) => <div>{children}</div> }));
    vi.doMock('@/auth/useEntitlements', () => ({
      useEntitlements: () => ({ usage: () => ({ used: 0, limit: 10, ratio: 0, tone: 'ok', label: '' }), track: vi.fn(), can: () => true, consume: vi.fn(), check: vi.fn(), requireFeature: () => true, openUpgrade: vi.fn() }),
    }));
    const { default: Projects } = await import('@/pages/Projects');

    const a = render(<MemoryRouter><Projects /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('หนังสือของ A')).toBeInTheDocument());
    expect(screen.queryByText('หนังสือของ B')).not.toBeInTheDocument();
    a.unmount();

    currentUid = USER_B.id;
    render(<MemoryRouter><Projects /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('หนังสือของ B')).toBeInTheDocument());
    expect(screen.queryByText('หนังสือของ A')).not.toBeInTheDocument();
  });
});

describe('local knowledge store is namespaced per account', () => {
  it('switching users swaps the store and never leaks sources', async () => {
    vi.doMock('@/auth/AuthProvider', () => ({
      useAuth: () => ({ user: { id: currentUid }, account: null, profile: null, refresh: vi.fn(), isAdmin: false, loading: false }),
    }));
    const { KnowledgeProvider, useKnowledge } = await import('@/knowledge/store');

    const Probe = () => {
      const { sources: list, addNote, notes } = useKnowledge();
      return (
        <div>
          <span data-testid="count">{list.length}</span>
          <span data-testid="notes">{notes.length}</span>
          <button onClick={() => addNote({ text: 'โน้ตของฉัน', sourceId: null } as any)}>add</button>
        </div>
      );
    };

    currentUid = USER_A.id;
    const a = render(
      <KnowledgeProvider>
        <Probe />
      </KnowledgeProvider>,
    );
    await act(async () => {
      screen.getByText('add').click();
    });
    expect(screen.getByTestId('notes').textContent).toBe('1');
    const keys = Object.keys(localStorage);
    expect(keys.some(k => k.includes(USER_A.id))).toBe(true);
    a.unmount();

    currentUid = USER_B.id;
    render(
      <KnowledgeProvider>
        <Probe />
      </KnowledgeProvider>,
    );
    expect(screen.getByTestId('notes').textContent).toBe('0');
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(localStorage.getItem(`paperpetal.knowledge.v2.${USER_A.id}`)).toContain('โน้ตของฉัน');
    expect(localStorage.getItem(`paperpetal.knowledge.v2.${USER_B.id}`) ?? '').not.toContain('โน้ตของฉัน');
  });
});
