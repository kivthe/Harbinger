import { cn } from '@/lib/cn';
import { usePlayerStore } from '@/store/player';

export function VinylDisc() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  return (
    <div
      className={cn(
        'h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-gray-200',
        isPlaying ? 'vinyl-spin' : 'vinyl-paused'
      )}
      title={isPlaying ? 'Играет' : 'Пауза'}
    >
      <img
        src="/media/images/vinyl.png"
        alt="Vinyl"
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}