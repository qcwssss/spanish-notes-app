import Link from 'next/link';
import { ROUTES } from '@/constants';
import { CircleHelp } from 'lucide-react';

interface FaqEntryLinkProps {
  label: string;
  className?: string;
}

const DEFAULT_CLASSNAME =
  'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-slate-700';

export default function FaqEntryLink({ label, className }: FaqEntryLinkProps) {
  return (
    <Link href={ROUTES.faq} className={className ?? DEFAULT_CLASSNAME}>
      <CircleHelp className="h-4 w-4" />
      {label}
    </Link>
  );
}
