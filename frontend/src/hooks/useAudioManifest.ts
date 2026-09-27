import { useQuery } from '@tanstack/react-query';

import { loadManifest } from '@/api/music';

export const audioManifestKey = ['audio-manifest'] as const;

export function useAudioManifest() {
  return useQuery({
    queryKey: audioManifestKey,
    queryFn: loadManifest,
    staleTime: Infinity,
  });
}