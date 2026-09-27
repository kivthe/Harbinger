import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

interface Props {
  dueDate: string;
  variant?: 'badge' | 'inline';
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function calcParts(target: number, now: number): TimeParts {
  const diff = target - now;
  const abs = Math.abs(diff);
  const totalSeconds = Math.floor(abs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalMs: diff,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function AnimatedNumber({ value }: { value: string }) {
  return (
    <span key={value} className="digit-flip inline-block">
      {value}
    </span>
  );
}

export function DeadlineCountdown({ dueDate, variant = 'badge' }: Props) {
  const target = new Date(dueDate).getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = calcParts(target, now);
  const isOverdue = parts.totalMs <= 0;

  const tone = isOverdue
    ? 'bg-red-100 text-red-700 pulse-soft'
    : parts.days === 0 && parts.hours < 3
      ? 'bg-orange-100 text-orange-700'
      : parts.days === 0 && parts.hours < 24
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-700';

  const secondsStr = pad(parts.seconds);
  const minutesStr = pad(parts.minutes);
  const hoursStr = pad(parts.hours);
  const daysStr = parts.days > 0 ? String(parts.days) : null;

  if (variant === 'inline') {
    return (
      <span className={cn('font-mono text-sm tabular-nums', isOverdue ? 'text-red-600' : 'text-gray-700')}>
        {isOverdue ? 'просрочено ' : 'осталось '}
        {daysStr && <>{daysStr}д </>}
        <AnimatedNumber value={hoursStr} />:
        <AnimatedNumber value={minutesStr} />:
        <AnimatedNumber value={secondsStr} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
        tone
      )}
      title={new Date(dueDate).toLocaleString('ru-RU')}
    >
      <span aria-hidden>⏱</span>
      <span>{isOverdue ? 'Просрочено' : 'Осталось'}:</span>
      <span className="flex items-center font-mono tabular-nums">
        {daysStr && (
          <>
            <AnimatedNumber value={daysStr} />
            <span className="mx-0.5">д</span>
          </>
        )}
        <AnimatedNumber value={hoursStr} />
        <span className="mx-0.5">:</span>
        <AnimatedNumber value={minutesStr} />
        <span className="mx-0.5">:</span>
        <AnimatedNumber value={secondsStr} />
      </span>
    </span>
  );
}