import { supabase } from '@/lib/supabase';
import type { Task, TaskStatus } from '@/types/domain';
import type { Database } from '@/types/database';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export async function fetchTasks(tripId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(
      `
      *,
      assignee:profiles!tasks_assignee_id_fkey ( id, display_name, avatar_url )
    `,
    )
    .eq('trip_id', tripId)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as unknown as Task[];
}

export async function createTask(
  tripId: string,
  input: Omit<TaskInsert, 'trip_id' | 'created_by'>,
  createdBy: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, trip_id: tripId, created_by: createdBy })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(taskId: string, input: TaskUpdate): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}

export async function toggleTask(
  taskId: string,
  currentStatus: TaskStatus,
): Promise<Task> {
  const newStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}
