/**
 * Favorites CRUD — chrome.storage.local, max 50 items.
 */

export interface FavoriteItem {
  id: string;
  type: 'optimized' | 'scored' | 'variant';
  content: string;
  label: string;
  score?: number;
  createdAt: number;
}

const STORAGE_KEY = 'engageboost_favorites';
const MAX_FAVORITES = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve((result[STORAGE_KEY] as FavoriteItem[]) || []);
    });
  });
}

export async function addFavorite(
  item: Omit<FavoriteItem, 'id' | 'createdAt'>
): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();

  // Prevent duplicate content
  const exists = favorites.some((f) => f.content === item.content && f.type === item.type);
  if (exists) return favorites;

  const newItem: FavoriteItem = {
    ...item,
    id: generateId(),
    createdAt: Date.now(),
  };

  const updated = [newItem, ...favorites].slice(0, MAX_FAVORITES);
  await saveFavorites(updated);
  return updated;
}

export async function removeFavorite(id: string): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();
  const updated = favorites.filter((f) => f.id !== id);
  await saveFavorites(updated);
  return updated;
}

export async function isFavorited(content: string, type: FavoriteItem['type']): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.content === content && f.type === type);
}

export async function getFavoriteCount(): Promise<number> {
  const favorites = await getFavorites();
  return favorites.length;
}

export async function clearAllFavorites(): Promise<void> {
  await saveFavorites([]);
}

function saveFavorites(favorites: FavoriteItem[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: favorites }, resolve);
  });
}
