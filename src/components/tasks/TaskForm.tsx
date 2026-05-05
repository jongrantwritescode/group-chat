import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Task, TaskStatus, TripMember } from '@/types/domain';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  members: TripMember[];
  editingTask?: Task;
  loading?: boolean;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskForm({
  open,
  onClose,
  onSubmit,
  members,
  editingTask,
  loading,
}: TaskFormProps) {
  const memberOptions = [
    { value: '', label: 'No assignee' },
    ...members.map((m) => ({
      value: m.user_id,
      label: m.profile?.display_name ?? m.user_id,
    })),
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'todo',
      ...(editingTask && {
        title: editingTask.title,
        description: editingTask.description ?? '',
        assignee_id: editingTask.assignee_id ?? '',
        due_date: editingTask.due_date ?? '',
        status: editingTask.status,
      }),
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Sheet open={open} onClose={handleClose} title={editingTask ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Title *"
          placeholder="e.g., Book hotel rooms"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Additional details..."
          rows={3}
          {...register('description')}
        />

        <Select
          label="Assign to"
          options={memberOptions}
          {...register('assignee_id')}
        />

        <Input
          label="Due Date"
          type="date"
          {...register('due_date')}
        />

        {editingTask && (
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            {...register('status')}
          />
        )}

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          {editingTask ? 'Save Changes' : 'Create Task'}
        </Button>
      </form>
    </Sheet>
  );
}
