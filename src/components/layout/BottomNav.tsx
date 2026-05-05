import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Trips',
    path: '/',
    icon: <Map size={22} strokeWidth={1.5} />,
    activeIcon: <Map size={22} strokeWidth={2.5} />,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings size={22} strokeWidth={1.5} />,
    activeIcon: <Settings size={22} strokeWidth={2.5} />,
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 pb-safe">
      <div className="flex h-16">
        {navItems.map((item) => {
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] transition-colors',
                isActive ? 'text-primary-600' : 'text-slate-400',
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? item.activeIcon : item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
