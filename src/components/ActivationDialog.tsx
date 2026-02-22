'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { redeemActivationCode, type RedeemResult } from '@/utils/activation/redeem';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';

interface ActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActivationDialog({ open, onOpenChange }: ActivationDialogProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const getStatusMessage = (status: RedeemResult['status'], message?: string) => {
    switch (status) {
      case 'already_activated':
        return t('activation.alreadyActivated');
      case 'invalid_code':
        return t('activation.invalidCode');
      case 'code_fully_used':
        return t('activation.codeFullyUsed');
      case 'db_error':
        return t('activation.dbError');
      default:
        return message || t('activation.failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await redeemActivationCode(code.trim());
      
      if (result.success) {
        onOpenChange(false);
        toast({ title: t('activation.success') });
        setTimeout(() => {
          window.location.href = '/app';
        }, 500);
      } else {
        setError(getStatusMessage(result.status, result.message));
      }
    } catch (err) {
      setError(t('activation.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 dark:bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md z-50 shadow-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <Dialog.Title className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
              🔓 {t('activation.title')}
            </Dialog.Title>
            
            <Dialog.Description className="mb-6 space-y-2 text-slate-600 dark:text-slate-300">
              <p>{t('activation.description')}</p>
              <ul className="list-disc list-inside text-sm text-slate-500 space-y-1 dark:text-slate-400">
                <li>{t('activation.feature1')}</li>
                <li>{t('activation.feature2')}</li>
                <li>{t('activation.feature3')}</li>
              </ul>
            </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('activation.inputPlaceholder')}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  disabled={isLoading}
                >
                  {t('activation.cancel')}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? t('activation.submitting') : t('activation.submit')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
