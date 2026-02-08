'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { revokeNoteShare } from '@/utils/shares/queries';
import { useToast } from '@/components/ToastProvider';
import { useI18n } from '@/components/I18nProvider';

interface RevokeShareButtonProps {
  noteId: string;
}

export default function RevokeShareButton({ noteId }: RevokeShareButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            await revokeNoteShare(noteId);
            toast({ title: t('share.revokeSuccess') });
            router.refresh();
          } catch (error) {
            console.error('Failed to revoke share:', error);
            toast({ title: t('share.revokeFailed'), variant: 'destructive' });
          }
        });
      }}
      className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
    >
      {isPending ? t('share.revoking') : t('share.revoke')}
    </button>
  );
}
