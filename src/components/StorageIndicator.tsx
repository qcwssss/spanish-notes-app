import { formatCharacterCount } from '@/utils/storage/limits';
import { useI18n } from '@/components/I18nProvider';

interface StorageIndicatorProps {
  used: number;
  limit: number;
}

export default function StorageIndicator({ used, limit }: StorageIndicatorProps) {
  const { t } = useI18n();
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  
  let barColor = 'bg-blue-500';
  if (percentage >= 90) {
    barColor = 'bg-red-500';
  } else if (percentage >= 70) {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>📝 {formatCharacterCount(used)}/{formatCharacterCount(limit)} {t('storage.characters')}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full rounded-full bg-slate-200 h-1.5 dark:bg-slate-700">
        <div 
          className={`${barColor} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
