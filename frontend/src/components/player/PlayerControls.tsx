import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePlayerStore } from '@/store/player';
import { cn } from '@/lib/cn';
import { VinylDisc } from './VinylDisc';

function IconButton({
  icon,
  onClick,
  title,
  disabled,
  active,
}: {
  icon: string;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
        'hover:bg-gray-100',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
        active && 'bg-gray-200'
      )}
    >
      <img
        src={`/media/images/player/${icon}`}
        alt={title}
        className="h-5 w-5 object-contain"
        draggable={false}
      />
    </button>
  );
}

export function PlayerControls() {
  const player = useAudioPlayer();
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const loop = usePlayerStore((s) => s.loop);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);

  const noTrack = !currentTrack;

  return (
    <div className="flex items-center gap-3">
      <VinylDisc />

      <div className="flex items-center gap-0.5 rounded-full border bg-white px-1 py-0.5">
        <IconButton
          icon="prev.png"
          onClick={player.prev}
          title="Предыдущий"
          disabled={noTrack}
        />

        <IconButton
          icon="rewind.png"
          onClick={player.restart}
          title="Сначала"
          disabled={noTrack}
        />

        <IconButton
          icon={isPlaying ? 'pause.png' : 'play.png'}
          onClick={player.toggle}
          title={isPlaying ? 'Пауза' : 'Играть'}
        />

        <IconButton
          icon="stop.png"
          onClick={player.stop}
          title="Стоп"
          disabled={noTrack}
        />

        <IconButton
          icon="next.png"
          onClick={player.next}
          title="Следующий"
          disabled={noTrack}
        />

        <IconButton
          icon="loop.png"
          onClick={toggleLoop}
          title={loop ? 'Повтор включён' : 'Повтор выключен'}
          active={loop}
        />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="h-1 w-24 cursor-pointer accent-gray-900"
        title={`Громкость: ${volume}%`}
      />
    </div>
  );
}