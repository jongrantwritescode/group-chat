import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}

export function Header({ title, showBack, onBack, action, className }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header
      className={cn(
        'sticky top-0 z-20 bg-white border-b border-slate-200 pt-safe',
        className,
      )}
    >
      <div className="flex h-14 items-center px-4 gap-2">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center -ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="flex-1 text-lg font-semibold text-slate-900 truncate">{title}</h1>
        {action && <div className="flex items-center">{action}</div>}
      </div>
    </header>
  );
}
