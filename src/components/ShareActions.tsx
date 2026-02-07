'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';
import { createOrGetNoteShare, getActiveShareToken, revokeNoteShare } from '@/utils/shares/queries';

interface ShareActionsProps {
  noteId: string;
}

export default function ShareActions({ noteId }: ShareActionsProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadShareState = async () => {
      setIsLoading(true);
      try {
        const activeToken = await getActiveShareToken(noteId);
        if (!cancelled) {
          setToken(activeToken);
        }
      } catch {
        if (!cancelled) {
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadShareState();
    return () => {
      cancelled = true;
    };
  }, [noteId]);

  const copyLink = async (shareToken: string) => {
    const link = `${window.location.origin}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: t('share.copySuccess') });
    } catch {
      toast({ title: t('share.copyFailed'), variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    setIsWorking(true);
    try {
      const result = await createOrGetNoteShare(noteId);
      setToken(result.token);
      await copyLink(result.token);
    } catch {
      toast({ title: t('share.createFailed'), variant: 'destructive' });
    } finally {
      setIsWorking(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    await copyLink(token);
  };

  const handleRevoke = async () => {
    setIsWorking(true);
    try {
      await revokeNoteShare(noteId);
      setToken(null);
      toast({ title: t('share.revokeSuccess') });
    } catch {
      toast({ title: t('share.revokeFailed'), variant: 'destructive' });
    } finally {
      setIsWorking(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 text-slate-500 bg-slate-100 rounded-lg border border-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
      >
        {t('share.loading')}
      </button>
    );
  }

  if (!token) {
    return (
      <button
        onClick={handleShare}
        disabled={isWorking}
        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 disabled:opacity-50 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-900/30"
      >
        {t('share.button')}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleCopy}
        disabled={isWorking}
        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 disabled:opacity-50 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-900/30"
      >
        {t('share.copyLink')}
      </button>
      <button
        onClick={handleRevoke}
        disabled={isWorking}
        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200 disabled:opacity-50 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-300 dark:border-amber-900/30"
      >
        {t('share.revoke')}
      </button>
    </>
  );
}
