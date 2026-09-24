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

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return String(year) + "-" + month + "-" + day;
}

function todayKey(): string {
  return dateKey(new Date());
}

function isProgressStatus(value: unknown): value is ProgressStatus {
  return value === "todo" || value === "attempted" || value === "solved" || value === "review";
}

function normalizeState(raw: unknown): UserState {
  const fallback = createDefaultState();
  if (!raw || typeof raw !== "object") return fallback;

  const value = raw as Partial<UserState>;
  const bookmarks = Array.isArray(value.bookmarks)
    ? value.bookmarks.filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0)
    : [];

  const progress: Record<string, ProblemProgress> = {};
  if (value.progress && typeof value.progress === "object") {
    for (const [slug, entry] of Object.entries(value.progress)) {
      if (!entry || typeof entry !== "object") continue;
      const candidate = entry as Partial<ProblemProgress>;
      progress[slug] = {
        status: isProgressStatus(candidate.status) ? candidate.status : "todo",
        confidence:
          typeof candidate.confidence === "number" && Number.isFinite(candidate.confidence)
            ? Math.min(5, Math.max(0, candidate.confidence))
            : 0,
        notes: typeof candidate.notes === "string" ? candidate.notes : "",
        lastSeen: typeof candidate.lastSeen === "string" ? candidate.lastSeen : new Date().toISOString(),
      };
    }
  }

  const streakValue = value.streak && typeof value.streak === "object" ? value.streak : {};
  const current =
    typeof streakValue.current === "number" && Number.isFinite(streakValue.current)
      ? Math.max(0, Math.floor(streakValue.current))
      : 0;
  const lastDate =
    typeof streakValue.lastDate === "string" || streakValue.lastDate === null
      ? streakValue.lastDate
      : null;

  return {
    bookmarks: [...new Set(bookmarks)],
    progress,
    streak: { current, lastDate },
    version: 1,
  };
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
      this.state = normalizeState(JSON.parse(raw));
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
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return state;
    const bookmarks = new Set(state.bookmarks);

    if (bookmarks.has(normalizedSlug)) bookmarks.delete(normalizedSlug);
    else bookmarks.add(normalizedSlug);

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

    const confidence =
      typeof patch.confidence === "number" && Number.isFinite(patch.confidence)
        ? Math.min(5, Math.max(0, patch.confidence))
        : previous.confidence;
    const status = isProgressStatus(patch.status) ? patch.status : previous.status;
    const notes = typeof patch.notes === "string" ? patch.notes : previous.notes;

    return this.save({
      ...state,
      progress: {
        ...state.progress,
        [slug]: {
          ...previous,
          ...patch,
          confidence,
          status,
          notes,
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
    const yesterdayKey = dateKey(yesterday);
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
