import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useToggleTask } from '@/hooks/useTasks';
import { useTripMembers } from '@/hooks/useTripMembers';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import type { Task } from '@/types/domain';

interface TasksTabProps {
  tripId: string;
  currentUserId: string;
}

export function TasksTab({ tripId, currentUserId }: TasksTabProps) {
  const { data: tasks, isLoading } = useTasks(tripId);
  const { data: members } = useTripMembers(tripId);
  const createTask = useCreateTask(tripId);
  const updateTask = useUpdateTask(tripId);
  const toggleTask = useToggleTask(tripId);
  const { addToast } = useUIStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(task: Task) {
    setTogglingId(task.id);
    try {
      await toggleTask.mutateAsync({ id: task.id, status: task.status });
    } catch {
      addToast('Failed to update task', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleFormSubmit(values: {
    title: string;
    description?: string;
    assignee_id?: string;
    due_date?: string;
    status: 'todo' | 'in_progress' | 'done';
  }) {
    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          taskId: editingTask.id,
          input: {
            title: values.title,
            description: values.description ?? null,
            assignee_id: values.assignee_id || null,
            due_date: values.due_date ?? null,
            status: values.status,
          },
        });
        addToast('Task updated', 'success');
      } else {
        await createTask.mutateAsync({
          input: {
            title: values.title,
            description: values.description ?? null,
            assignee_id: values.assignee_id || null,
            due_date: values.due_date ?? null,
            status: values.status,
          },
          createdBy: currentUserId,
        });
        addToast('Task created', 'success');
      }
      setFormOpen(false);
      setEditingTask(undefined);
    } catch {
      addToast('Failed to save task', 'error');
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-4 py-2">
        <Button
          size="sm"
          onClick={() => {
            setEditingTask(undefined);
            setFormOpen(true);
          }}
        >
          <Plus size={16} />
          New Task
        </Button>
      </div>

      <TaskList
        tasks={tasks ?? []}
        onToggle={handleToggle}
        onEdit={(task) => {
          setEditingTask(task);
          setFormOpen(true);
        }}
        togglingId={togglingId}
      />

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleFormSubmit}
        members={members ?? []}
        editingTask={editingTask}
        loading={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}
