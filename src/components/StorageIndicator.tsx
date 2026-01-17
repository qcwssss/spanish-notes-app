import { formatCharacterCount } from '@/utils/storage/limits';

interface StorageIndicatorProps {
  used: number;
  limit: number;
}

export default function StorageIndicator({ used, limit }: StorageIndicatorProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  
  let barColor = 'bg-blue-500';
  if (percentage >= 90) {
    barColor = 'bg-red-500';
  } else if (percentage >= 70) {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>📝 {formatCharacterCount(used)}/{formatCharacterCount(limit)}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div 
          className={`${barColor} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
