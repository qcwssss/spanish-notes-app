import Link from 'next/link';
import { ROUTES } from '@/constants';
import { CircleHelp } from 'lucide-react';

interface FaqEntryLinkProps {
  label: string;
  className?: string;
}

const DEFAULT_CLASSNAME =
  'inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600 hover:underline dark:text-slate-400 dark:hover:text-blue-400';

export default function FaqEntryLink({ label, className }: FaqEntryLinkProps) {
  return (
    <Link href={ROUTES.faq} className={className ?? DEFAULT_CLASSNAME}>
      <CircleHelp className="h-4 w-4" />
      {label}
    </Link>
  );
}
