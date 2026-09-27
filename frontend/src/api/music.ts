import axios from 'axios';

import type { AudioManifest } from '@/types/music';

export async function loadManifest(): Promise<AudioManifest> {
  const response = await axios.get<AudioManifest>('/media/audio/manifest.json', {
    baseURL: '',
  });
  return response.data;
}