export interface Track {
  id: string;
  title: string;
  artist?: string;
  file: string;
  duration: number;
}

export interface AudioManifest {
  tracks: Track[];
}