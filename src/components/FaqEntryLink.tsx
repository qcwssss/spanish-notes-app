import Link from 'next/link';
import { ROUTES } from '@/constants';

interface FaqEntryLinkProps {
  label: string;
  className?: string;
}

const DEFAULT_CLASSNAME =
  'text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100';

export default function FaqEntryLink({ label, className }: FaqEntryLinkProps) {
  return (
    <Link href={ROUTES.faq} className={className ?? DEFAULT_CLASSNAME}>
      {label}
    </Link>
  );
}
