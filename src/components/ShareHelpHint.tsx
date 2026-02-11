'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';

interface ShareHelpHintProps {
  ctaLabel: string;
  title: string;
  steps: string[];
  tip: string;
}

export default function ShareHelpHint({ ctaLabel, title, steps, tip }: ShareHelpHintProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popupId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-950"
        aria-label={ctaLabel}
        aria-expanded={open}
        aria-controls={popupId}
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      {open ? (
        <div
          id={popupId}
          className="absolute right-0 top-11 z-10 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <ol className="mt-2 list-decimal list-outside space-y-2 pl-5 text-xs text-slate-600 dark:text-slate-300">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{tip}</p>
        </div>
      ) : null}
    </div>
  );
}
