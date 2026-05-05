import { CheckCircle2, Circle, Clock, UserCircle2, CalendarDays } from 'lucide-react';
import type { Task } from '@/types/domain';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit?: (task: Task) => void;
  toggling?: boolean;
}

export function TaskRow({ task, onToggle, onEdit, toggling }: TaskRowProps) {
  const isDone = task.status === 'done';
  const isOverdue =
    task.due_date &&
    !isDone &&
    new Date(task.due_date) < new Date(new Date().toDateString());

  return (
    <div
      className={cn(
        'flex items-start gap-3 bg-white rounded-xl border p-3 transition-opacity',
        isDone ? 'opacity-60 border-slate-100' : 'border-slate-200',
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        disabled={toggling}
        className={cn(
          'flex-shrink-0 mt-0.5 transition-colors',
          isDone ? 'text-green-500' : 'text-slate-300 hover:text-primary-500',
        )}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {isDone ? (
          <CheckCircle2 size={22} />
        ) : (
          <Circle size={22} />
        )}
      </button>

      {/* Content */}
      <button
        onClick={() => onEdit?.(task)}
        className="flex-1 min-w-0 text-left"
      >
        <p
          className={cn(
            'text-sm font-medium',
            isDone ? 'line-through text-slate-400' : 'text-slate-900',
          )}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-1">
              <Avatar
                src={task.assignee.avatar_url}
                name={task.assignee.display_name}
                size="sm"
              />
              <span className="text-xs text-slate-500">{task.assignee.display_name}</span>
            </div>
          )}

          {/* Due date */}
          {task.due_date && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-red-600' : 'text-slate-500',
              )}
            >
              <CalendarDays size={12} />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
