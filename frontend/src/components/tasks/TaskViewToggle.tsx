import { cn } from '@/lib/cn';

export type TaskView = 'list' | 'board';

interface Props {
  view: TaskView;
  onChange: (view: TaskView) => void;
}

const options: { value: TaskView; label: string }[] = [
  { value: 'list', label: 'Список' },
  { value: 'board', label: 'Доска' },
];

export function TaskViewToggle({ view, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border bg-white p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded px-3 py-1 text-sm transition-colors',
            view === opt.value
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}