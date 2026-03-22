'use client';

import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Mail, X } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { ROUTES } from '@/constants';

const nextPath = ROUTES.app;

export default function LandingAuthDialog({ triggerLabel }: { triggerLabel: string }) {
  const { t } = useI18n();
  const emailSignInHref = `${ROUTES.authSignIn}?next=${encodeURIComponent(nextPath)}`;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="rounded-xl bg-blue-600/90 px-6 py-2.5 font-medium text-white shadow-[0_0_20px_-5px_rgba(37,99,234,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_-5px_rgba(37,99,234,0.6)]">
          {triggerLabel}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-800 bg-[#0d0f14] p-6 text-slate-100 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-2xl font-semibold tracking-tight text-white">
                {t('auth.modalTitle')}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-400">
                {t('auth.modalSubtitle')}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                aria-label={t('auth.close')}
                className="rounded-full border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm font-medium text-white">{t('auth.googleOptionTitle')}</p>
              <p className="mt-1 text-sm text-slate-400">{t('auth.googleOptionDescription')}</p>
              <GoogleSignInButton
                label={t('auth.continueWithGoogle')}
                nextPath={nextPath}
                className="mt-4 w-full rounded-xl bg-white px-4 py-3 font-medium text-slate-950 transition-colors hover:bg-slate-200"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm font-medium text-white">{t('auth.emailOptionTitle')}</p>
              <p className="mt-1 text-sm text-slate-400">{t('auth.emailOptionDescription')}</p>
              <Link
                href={emailSignInHref}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-800"
              >
                <Mail className="h-4 w-4" />
                {t('auth.continueWithEmail')}
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
