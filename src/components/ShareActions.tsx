'use client';

import { useEffect, useRef, useState } from 'react';
import { Ellipsis, Link2, Pencil, Share2, Trash2, X } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';
import { createOrGetNoteShare, getActiveShareToken, revokeNoteShare } from '@/utils/shares/queries';

interface ShareActionsProps {
  noteId: string;
  onRequestEdit: () => void;
  onRequestDelete: () => void;
}

export default function ShareActions({ noteId, onRequestEdit, onRequestDelete }: ShareActionsProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadShareState = async () => {
      setIsLoading(true);
      try {
        const activeToken = await getActiveShareToken(noteId);
        if (!cancelled) {
          setToken(activeToken);
        }
      } catch (error) {
        console.error('Failed to load share state:', error);
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

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

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

  return (
    <div
      ref={menuRef}
      className="fixed right-4 z-40 flex items-center gap-2 md:right-6"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <button
        type="button"
        onClick={onRequestEdit}
        aria-label={t('editor.edit')}
        title={t('editor.edit')}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        disabled={isLoading || isWorking}
        aria-label={t('share.moreActions')}
        title={t('share.moreActions')}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Ellipsis className="h-4 w-4" />
      </button>

      {menuOpen && (
        <div className="absolute bottom-14 right-0 z-20 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {token && (
            <button
              type="button"
              onClick={async () => {
                await handleCopy();
                setMenuOpen(false);
              }}
              aria-label={t('share.copyLink')}
              title={t('share.copyLink')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              <Link2 className="h-4 w-4" />
            </button>
          )}

          {token && (
            <button
              type="button"
              onClick={async () => {
                await handleRevoke();
                setMenuOpen(false);
              }}
              aria-label={t('share.revoke')}
              title={t('share.revoke')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-amber-700 transition-colors hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/30"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {!token && (
            <button
              type="button"
              onClick={async () => {
                await handleShare();
                setMenuOpen(false);
              }}
              aria-label={t('share.button')}
              title={t('share.button')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onRequestDelete();
              setMenuOpen(false);
            }}
            aria-label={t('editor.delete')}
            title={t('editor.delete')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-red-700 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
