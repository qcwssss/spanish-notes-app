'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '@/components/I18nProvider';

interface FolderDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onDeleteKeepNotes: () => void;
  onDeleteAllInit: () => void;
}

export function FolderDeleteDialog({
  open,
  onOpenChange,
  isDeleting,
  onDeleteKeepNotes,
  onDeleteAllInit,
}: FolderDeleteDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 dark:bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <Dialog.Title className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('folders.deleteFolderTitle')}
          </Dialog.Title>
          
          <div className="space-y-3">
            <button
              onClick={onDeleteKeepNotes}
              disabled={isDeleting}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700/50 dark:hover:bg-slate-700"
            >
              <span className="font-medium text-slate-900 dark:text-slate-200">{t('folders.deleteKeepNotes')}</span>
              <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('folders.deleteKeepNotesDesc')}</span>
            </button>

            <button
              onClick={onDeleteAllInit}
              disabled={isDeleting}
              className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-left font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:border-red-800"
            >
              {t('folders.deleteAll')}
            </button>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {t('editor.cancel')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function FolderConfirmDeleteAllDialog({
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onConfirm: () => void;
}) {
  const { t } = useI18n();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 dark:bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <Dialog.Title className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('folders.deleteConfirmTitle')}
          </Dialog.Title>
          
          <Dialog.Description className="mb-6 text-slate-600 dark:text-slate-300">
            {t('folders.deleteConfirmDesc')}
          </Dialog.Description>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {t('editor.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
            >
              {isDeleting ? t('folders.deleting') : t('editor.delete')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
