import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask, updateTask, deleteTask, toggleTask } from '@/api/tasks';
import type { Task, TaskStatus } from '@/types/domain';
import type { Database } from '@/types/database';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export function useTasks(tripId: string) {
  return useQuery({
    queryKey: ['tasks', tripId],
    queryFn: () => fetchTasks(tripId),
    enabled: !!tripId,
  });
}

export function useCreateTask(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      createdBy,
    }: {
      input: Omit<TaskInsert, 'trip_id' | 'created_by'>;
      createdBy: string;
    }) => createTask(tripId, input, createdBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', tripId] });
    },
  });
}

export function useUpdateTask(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: TaskUpdate }) =>
      updateTask(taskId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', tripId] });
    },
  });
}

export function useDeleteTask(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', tripId] });
    },
  });
}

export function useToggleTask(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      toggleTask(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks', tripId] });
      const prev = qc.getQueryData<Task[]>(['tasks', tripId]);

      const newStatus: TaskStatus = status === 'done' ? 'todo' : 'done';
      qc.setQueryData<Task[]>(['tasks', tripId], (old) =>
        old?.map((t) =>
          t.id === id
            ? {
                ...t,
                status: newStatus,
                completed_at: newStatus === 'done' ? new Date().toISOString() : null,
              }
            : t,
        ) ?? [],
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['tasks', tripId], ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks', tripId] });
    },
  });
}
