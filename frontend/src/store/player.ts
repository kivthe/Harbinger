import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Track } from '@/types/music';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  loop: boolean;

  /** Текущий порядок воспроизведения (зависит от сортировки в меню). */
  playlist: Track[];

  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setLoop: (loop: boolean) => void;
  toggleLoop: () => void;
  setPlaylist: (tracks: Track[]) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 50,
      currentTime: 0,
      loop: false,
      playlist: [],

      setCurrentTrack: (currentTrack) => set({ currentTrack, currentTime: 0 }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setLoop: (loop) => set({ loop }),
      toggleLoop: () => set((s) => ({ loop: !s.loop })),
      setPlaylist: (playlist) => set({ playlist }),
    }),
    {
      name: 'harbinger-player',
      partialize: (state) => ({ volume: state.volume, loop: state.loop }),
    }
  )
);