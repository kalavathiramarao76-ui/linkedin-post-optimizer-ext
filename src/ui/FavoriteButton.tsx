import React, { useState, useEffect, useCallback } from 'react';
import { addFavorite, removeFavorite, getFavorites, type FavoriteItem } from '../shared/favorites';
import { useToast } from './Toast';

interface FavoriteButtonProps {
  content: string;
  type: FavoriteItem['type'];
  label: string;
  score?: number;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ content, type, label, score }) => {
  const [favorited, setFavorited] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getFavorites().then((favs) => {
      setFavorited(favs.some((f) => f.content === content && f.type === type));
    });
  }, [content, type]);

  const toggle = useCallback(async () => {
    if (favorited) {
      const favs = await getFavorites();
      const match = favs.find((f) => f.content === content && f.type === type);
      if (match) {
        await removeFavorite(match.id);
        setFavorited(false);
        toast('Removed from favorites', 'info');
      }
    } else {
      await addFavorite({ type, content, label, score });
      setFavorited(true);
      setBouncing(true);
      setTimeout(() => setBouncing(false), 600);
      toast('Saved to favorites!', 'success');
    }
  }, [favorited, content, type, label, score, toast]);

  return (
    <button
      onClick={toggle}
      title={favorited ? 'Remove from favorites' : 'Save to favorites'}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className="favorite-btn"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 4px',
        fontSize: '18px',
        lineHeight: 1,
        transition: 'transform 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <span
        className={bouncing ? 'fav-bounce' : ''}
        style={{
          color: favorited ? '#f59e0b' : 'var(--text-tertiary)',
          filter: favorited ? 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' : 'none',
          transition: 'color 0.2s ease, filter 0.2s ease',
        }}
      >
        {favorited ? '\u2605' : '\u2606'}
      </span>
    </button>
  );
};

/** Badge showing favorite count — used in sidepanel header */
export const FavoriteBadge: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () => getFavorites().then((f) => setCount(f.length));
    load();

    // Listen for storage changes to keep badge in sync
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['engageboost_favorites']) {
        const newVal = changes['engageboost_favorites'].newValue as FavoriteItem[] | undefined;
        setCount(newVal ? newVal.length : 0);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  if (count === 0) return null;

  return (
    <span
      className="fav-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        borderRadius: '9px',
        background: '#f59e0b',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  );
};
