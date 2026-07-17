/**
 * Local-first user store. Cloud sync implements the same interface later.
 */

export type ProgressStatus = "todo" | "attempted" | "solved" | "review";

export interface ProblemProgress {
  status: ProgressStatus;
  confidence: number; // 1-5
  notes: string;
  lastSeen: string; // ISO
}

export interface UserState {
  bookmarks: string[];
  progress: Record<string, ProblemProgress>;
  streak: { current: number; lastDate: string | null };
  version: number;
}

export interface UserStore {
  getState(): UserState;
  toggleBookmark(slug: string): UserState;
  setProgress(slug: string, patch: Partial<ProblemProgress>): UserState;
  recordActivity(): UserState;
  /** Future cloud sync */
  sync?(): Promise<void>;
}

const STORAGE_KEY = "algoforge:user:v1";

const defaultState = (): UserState => ({
  bookmarks: [],
  progress: {},
  streak: { current: 0, lastDate: null },
  version: 1,
});

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export class LocalStorageUserStore implements UserStore {
  getState(): UserState {
    if (typeof window === "undefined") return defaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) } as UserState;
    } catch {
      return defaultState();
    }
  }

  private save(state: UserState): UserState {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return state;
  }

  toggleBookmark(slug: string): UserState {
    const state = this.getState();
    const set = new Set(state.bookmarks);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    return this.save({ ...state, bookmarks: [...set] });
  }

  setProgress(slug: string, patch: Partial<ProblemProgress>): UserState {
    const state = this.getState();
    const prev = state.progress[slug] ?? {
      status: "todo" as ProgressStatus,
      confidence: 0,
      notes: "",
      lastSeen: new Date().toISOString(),
    };
    return this.save({
      ...state,
      progress: {
        ...state.progress,
        [slug]: {
          ...prev,
          ...patch,
          lastSeen: new Date().toISOString(),
        },
      },
    });
  }

  recordActivity(): UserState {
    const state = this.getState();
    const today = todayKey();
    if (state.streak.lastDate === today) return state;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const current =
      state.streak.lastDate === yKey ? state.streak.current + 1 : 1;
    return this.save({
      ...state,
      streak: { current, lastDate: today },
    });
  }
}

/** Singleton for client components */
let clientStore: LocalStorageUserStore | null = null;

export function getUserStore(): UserStore {
  if (typeof window === "undefined") {
    // SSR no-op store
    return {
      getState: defaultState,
      toggleBookmark: () => defaultState(),
      setProgress: () => defaultState(),
      recordActivity: () => defaultState(),
    };
  }
  if (!clientStore) clientStore = new LocalStorageUserStore();
  return clientStore;
}
