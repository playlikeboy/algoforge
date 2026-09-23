/**
 * Local-first user store. Cloud sync implements the same interface later.
 */

export type ProgressStatus = "todo" | "attempted" | "solved" | "review";

export interface ProblemProgress {
  status: ProgressStatus;
  confidence: number;
  notes: string;
  lastSeen: string;
}

export interface UserState {
  bookmarks: string[];
  progress: Record<string, ProblemProgress>;
  streak: { current: number; lastDate: string | null };
  version: number;
}

type Listener = () => void;

export interface UserStore {
  getState(): UserState;
  subscribe(listener: Listener): () => void;
  toggleBookmark(slug: string): UserState;
  setProgress(slug: string, patch: Partial<ProblemProgress>): UserState;
  recordActivity(): UserState;
  sync?(): Promise<void>;
}

const STORAGE_KEY = "algoforge:user:v1";

const createDefaultState = (): UserState => ({
  bookmarks: [],
  progress: {},
  streak: { current: 0, lastDate: null },
  version: 1,
});

const SERVER_STATE = createDefaultState();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export class LocalStorageUserStore implements UserStore {
  private state = createDefaultState();
  private hydrated = false;
  private listeners = new Set<Listener>();

  private hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      this.state = { ...createDefaultState(), ...JSON.parse(raw) } as UserState;
    } catch {
      this.state = createDefaultState();
    }
  }

  getState = (): UserState => {
    this.hydrate();
    return this.state;
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    this.hydrate();
    return () => this.listeners.delete(listener);
  };

  private emit() {
    for (const listener of this.listeners) listener();
  }

  private save(state: UserState): UserState {
    this.state = state;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Keep the in-memory state usable when localStorage is unavailable.
      }
    }

    this.emit();
    return state;
  }

  toggleBookmark(slug: string): UserState {
    const state = this.getState();
    const bookmarks = new Set(state.bookmarks);

    if (bookmarks.has(slug)) bookmarks.delete(slug);
    else bookmarks.add(slug);

    return this.save({ ...state, bookmarks: [...bookmarks] });
  }

  setProgress(slug: string, patch: Partial<ProblemProgress>): UserState {
    const state = this.getState();
    const previous = state.progress[slug] ?? {
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
          ...previous,
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
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const current =
      state.streak.lastDate === yesterdayKey ? state.streak.current + 1 : 1;

    return this.save({
      ...state,
      streak: { current, lastDate: today },
    });
  }
}

const clientStore = new LocalStorageUserStore();

const serverStore: UserStore = {
  getState: () => SERVER_STATE,
  subscribe: () => () => {},
  toggleBookmark: () => SERVER_STATE,
  setProgress: () => SERVER_STATE,
  recordActivity: () => SERVER_STATE,
};

export function getUserStore(): UserStore {
  return typeof window === "undefined" ? serverStore : clientStore;
}

export function subscribeUserStore(listener: Listener): () => void {
  return getUserStore().subscribe(listener);
}

export function getUserStoreSnapshot(): UserState {
  return getUserStore().getState();
}

export function getServerUserStoreSnapshot(): UserState {
  return SERVER_STATE;
}
