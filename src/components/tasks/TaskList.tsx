import type { Task, TaskStatus } from '@/types/domain';
import { TaskRow } from './TaskRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckSquare } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit?: (task: Task) => void;
  togglingId?: string | null;
}

const STATUS_GROUPS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

export function TaskList({ tasks, onToggle, onEdit, togglingId }: TaskListProps) {
  const grouped = STATUS_GROUPS.map(({ status, label }) => ({
    status,
    label,
    tasks: tasks.filter((t) => t.status === status),
  })).filter((g) => g.tasks.length > 0);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare size={32} />}
        title="No tasks yet"
        description="Create tasks to track what needs to be done before and during your trip."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 py-4 px-4">
      {grouped.map(({ status, label, tasks: groupTasks }) => (
        <div key={status}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {label}
            </h3>
            <span className="text-xs text-slate-400">({groupTasks.length})</span>
          </div>
          <div className="flex flex-col gap-2">
            {groupTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                toggling={togglingId === task.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
