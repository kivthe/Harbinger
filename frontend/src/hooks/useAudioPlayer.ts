import { useEffect } from 'react';

import { useAudioManifest } from './useAudioManifest';
import { usePlayerStore } from '@/store/player';
import type { Track } from '@/types/music';

export function useAudioPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playlist = usePlayerStore((s) => s.playlist);
  const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);

  const { data: manifest } = useAudioManifest();

  // Если playlist пуст (первый запуск или после сброса) — заполняем из manifest
  const fallbackTracks: Track[] = manifest?.tracks ?? [];
  const effectivePlaylist = playlist.length > 0 ? playlist : fallbackTracks;

  // Синхронизация: при первой загрузке manifest — заполнить playlist
  useEffect(() => {
    if (playlist.length === 0 && fallbackTracks.length > 0) {
      usePlayerStore.getState().setPlaylist(fallbackTracks);
    }
  }, [playlist.length, fallbackTracks]);

  function play(track: Track) {
    setCurrentTrack(track);
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  function toggle() {
    if (!currentTrack) {
      if (effectivePlaylist.length > 0) play(effectivePlaylist[0]);
      return;
    }
    setIsPlaying(!isPlaying);
  }

  function stop() {
    setIsPlaying(false);
    setCurrentTime(0);
  }

  function seek(time: number) {
    const target = Math.max(0, time);
    setCurrentTime(target);
  }

  function restart() {
    setCurrentTime(0);
  }

  function next() {
    if (!currentTrack || effectivePlaylist.length === 0) return;
    const idx = effectivePlaylist.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % effectivePlaylist.length;
    play(effectivePlaylist[nextIdx]);
  }

  function prev() {
    if (!currentTrack || effectivePlaylist.length === 0) return;
    const idx = effectivePlaylist.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + effectivePlaylist.length) % effectivePlaylist.length;
    play(effectivePlaylist[prevIdx]);
  }

  return { play, pause, toggle, stop, seek, restart, next, prev };
}