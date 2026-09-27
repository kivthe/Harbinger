import { MusicMenu } from './MusicMenu';
import { PlayerControls } from './PlayerControls';

export function PlayerBar() {
  return (
    <div className="flex items-center gap-3">
      <PlayerControls />
      <MusicMenu />
    </div>
  );
}