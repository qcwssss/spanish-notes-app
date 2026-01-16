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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md z-50 shadow-xl">
          <Dialog.Title className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            🔓 激活你的账户
          </Dialog.Title>
          
          <Dialog.Description className="text-slate-300 mb-6 space-y-2">
            <p>输入激活码解锁完整功能：</p>
            <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
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
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                  disabled={isLoading}
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
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
