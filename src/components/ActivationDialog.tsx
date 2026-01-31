'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { redeemActivationCode } from '@/utils/activation/redeem';
import { useRouter } from 'next/navigation';

interface ActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActivationDialog({ open, onOpenChange }: ActivationDialogProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await redeemActivationCode(code.trim());
      
      if (result.success) {
        onOpenChange(false);
        router.refresh();
        // Show success toast (we'll add toast system later)
        alert(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('激活失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md z-50 shadow-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
          <Dialog.Title className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
            🔓 激活你的账户
          </Dialog.Title>
          
          <Dialog.Description className="mb-6 space-y-2 text-slate-600 dark:text-slate-300">
            <p>输入激活码解锁完整功能：</p>
            <ul className="list-disc list-inside text-sm text-slate-500 space-y-1 dark:text-slate-400">
              <li>创建和编辑笔记</li>
              <li>150,000 字符存储空间</li>
              <li>语音播放功能</li>
            </ul>
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="输入激活码"
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
                  取消
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? '激活中...' : '激活账户'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
