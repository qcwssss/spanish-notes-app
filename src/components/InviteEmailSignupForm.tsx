'use client';

import { FormEvent, useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';
import { useI18n } from '@/components/I18nProvider';
import { ROUTES } from '@/constants';

interface InviteEmailSignupFormProps {
  initialEmail?: string;
}

const MIN_PASSWORD_LENGTH = 8;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function InviteEmailSignupForm({ initialEmail = '' }: InviteEmailSignupFormProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState(normalizeEmail(initialEmail));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mapErrorMessage = (rawMessage: string) => {
    const normalized = rawMessage.toLowerCase();

    if (normalized.includes('invite_required')) {
      return t('inviteSignup.inviteRequired');
    }

    if (normalized.includes('invite_already_used')) {
      return t('inviteSignup.inviteUsed');
    }

    return t('inviteSignup.genericError');
  };

  const validateForm = (normalizedEmail: string) => {
    if (!normalizedEmail || !password || !confirmPassword) {
      return t('inviteSignup.invalidInput');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return t('inviteSignup.passwordTooShort');
    }

    if (password !== confirmPassword) {
      return t('inviteSignup.passwordMismatch');
    }

    return null;
  };

  const normalizedEmail = normalizeEmail(email);
  const canSubmit =
    Boolean(normalizedEmail) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length >= MIN_PASSWORD_LENGTH &&
    password === confirmPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validationError = validateForm(normalizedEmail);

    if (validationError) {
      setErrorMessage(validationError);
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(ROUTES.app)}`,
        },
      });

      if (error) {
        setErrorMessage(mapErrorMessage(error.message));
        setIsSuccess(false);
        return;
      }

      setIsSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch {
      setErrorMessage(t('inviteSignup.genericError'));
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <h1 className="text-2xl font-bold">{t('inviteSignup.title')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t('inviteSignup.subtitle')}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium" htmlFor="invite-signup-email">
          {t('inviteSignup.emailLabel')}
        </label>
        <input
          id="invite-signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500/40 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />

        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-medium" htmlFor="invite-signup-password">
            {t('inviteSignup.passwordLabel')}
          </label>
          <button
            type="button"
            aria-pressed={showPasswords}
            onClick={() => setShowPasswords((value) => !value)}
            className="rounded-md px-2 py-1 text-sm font-medium text-blue-700 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:text-blue-300 dark:hover:text-blue-200"
          >
            {showPasswords ? t('inviteSignup.hidePasswords') : t('inviteSignup.showPasswords')}
          </button>
        </div>
        <input
          id="invite-signup-password"
          type={showPasswords ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrorMessage(null);
            setIsSuccess(false);
          }}
          aria-describedby="invite-signup-password-help"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500/40 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <p id="invite-signup-password-help" className="text-sm text-slate-500 dark:text-slate-400">
          {t('inviteSignup.passwordRequirements')}
        </p>

        <label className="block text-sm font-medium" htmlFor="invite-signup-confirm-password">
          {t('inviteSignup.confirmPasswordLabel')}
        </label>
        <input
          id="invite-signup-confirm-password"
          type={showPasswords ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrorMessage(null);
            setIsSuccess(false);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500/40 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />

        {errorMessage && (
          <p role="alert" aria-live="assertive" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMessage}
          </p>
        )}

        {isSuccess && (
          <p role="status" aria-live="polite" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            {t('inviteSignup.success')}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          aria-busy={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? t('inviteSignup.submitting') : t('inviteSignup.submit')}
        </button>
      </form>
    </section>
  );
}
