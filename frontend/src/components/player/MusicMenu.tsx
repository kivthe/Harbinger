import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useAudioManifest } from '@/hooks/useAudioManifest';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePlayerStore } from '@/store/player';
import { formatDuration } from '@/lib/formatDuration';
import { cn } from '@/lib/cn';
import type { Track } from '@/types/music';

type SortKey = 'default' | 'title' | 'artist' | 'duration';
type SortDir = 'asc' | 'desc';

const SORT_LABELS: Record<SortKey, string> = {
  default: 'По умолчанию',
  title: 'По названию',
  artist: 'По автору',
  duration: 'По длине',
};

const DIR_ARROW: Record<SortDir, string> = {
  asc: '↑',
  desc: '↓',
};

function sortTracks(tracks: Track[], key: SortKey, dir: SortDir): Track[] {
  if (key === 'default') return tracks;

  const sign = dir === 'asc' ? 1 : -1;
  const sorted = [...tracks];

  switch (key) {
    case 'title':
      sorted.sort((a, b) => sign * a.title.localeCompare(b.title, 'ru'));
      break;
    case 'artist':
      sorted.sort(
        (a, b) => sign * (a.artist ?? '').localeCompare(b.artist ?? '', 'ru')
      );
      break;
    case 'duration':
      sorted.sort((a, b) => sign * (a.duration - b.duration));
      break;
  }
  return sorted;
}

function SmartText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    function check() {
      const container = containerRef.current;
      const measure = measureRef.current;
      if (!container || !measure) return;
      setOverflowing(measure.scrollWidth > container.clientWidth + 1);
    }

    check();

    const ro = new ResizeObserver(check);
    if (containerRef.current) ro.observe(containerRef.current);
    const measureEl = measureRef.current;
    if (measureEl) ro.observe(measureEl);

    return () => ro.disconnect();
  }, [text]);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      <span
        ref={measureRef}
        className="invisible absolute left-0 top-0 whitespace-nowrap text-sm"
        aria-hidden
      >
        {text}
      </span>

      {overflowing ? (
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="pr-8">{text}</span>
            <span className="pr-8" aria-hidden>
              {text}
            </span>
          </div>
        </div>
      ) : (
        <p className="truncate">{text}</p>
      )}
    </div>
  );
}

function SortOption({
  label,
  arrow,
  active,
  onClick,
}: {
  label: string;
  arrow?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-xs transition-colors',
        active
          ? 'bg-gray-100 font-medium text-gray-900'
          : 'text-gray-700 hover:bg-gray-50'
      )}
    >
      <span>{label}</span>
      {arrow && <span className="text-gray-500">{arrow}</span>}
    </button>
  );
}

export function MusicMenu() {
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const ref = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const { data: manifest, isLoading } = useAudioManifest();
  const player = useAudioPlayer();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);

  const tracks = useMemo(
    () => sortTracks(manifest?.tracks ?? [], sortKey, sortDir),
    [manifest, sortKey, sortDir]
  );

  // Синхронизация: при изменении сортировки — обновляем playlist в сторе
  useEffect(() => {
    if (tracks.length > 0) {
      setPlaylist(tracks);
    }
  }, [tracks, setPlaylist]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function cycleSort(key: SortKey) {
    if (key === 'default') {
      setSortKey('default');
      setSortOpen(false);
      return;
    }

    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortButtonLabel =
    sortKey === 'default'
      ? 'Сортировка'
      : `${SORT_LABELS[sortKey]} ${DIR_ARROW[sortDir]}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-colors hover:bg-gray-100"
        title="Музыка"
      >
        <img
          src="/media/images/player/playlist.png"
          alt="Playlist"
          className="h-5 w-5 object-contain"
          draggable={false}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b p-3">
            <h3 className="text-sm font-semibold">Фоновая музыка</h3>

            <div ref={sortRef} className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50"
                title="Сортировка (клик по активному пункту — обратный порядок)"
              >
                <span>{sortButtonLabel}</span>
                <span className="text-gray-400">▾</span>
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border bg-white py-1 shadow-lg">
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <SortOption
                      key={key}
                      label={SORT_LABELS[key]}
                      arrow={
                        key !== 'default' && key === sortKey
                          ? DIR_ARROW[sortDir]
                          : undefined
                      }
                      active={key === sortKey}
                      onClick={() => cycleSort(key)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {isLoading && <p className="p-3 text-sm text-gray-500">Загрузка…</p>}

          {!isLoading && tracks.length === 0 && (
            <p className="p-3 text-sm text-gray-500">Треков нет</p>
          )}

          <div className="max-h-80 overflow-y-auto">
            {tracks.map((track) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => player.play(track)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50',
                    isActive && 'bg-gray-100'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        'flex items-center gap-2 text-gray-900',
                        isActive && 'font-medium'
                      )}
                    >
                      {isActive && (
                        <span className="shrink-0 text-xs text-gray-600">
                          {isPlaying ? '▶' : '⏸'}
                        </span>
                      )}
                      <SmartText text={track.title} className="flex-1" />
                    </div>
                    {track.artist && (
                      <p className="truncate text-xs text-gray-500">
                        {track.artist}
                      </p>
                    )}
                  </div>
                  <span className="ml-2 shrink-0 text-xs text-gray-500">
                    {formatDuration(track.duration)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}